import * as moment from "moment";
import { Statement, Transaction, Banks } from "..";
import hash from "../hash";

/**
 * Function with which to parse a line from a downloaded FNB statement.
 *
 * @param line - the line to parse
 * @param memo - the statement with which the parsed data should be combined
 * @returns statement - the statement with more data parsed in
 */
export default function (line: string, memo: Statement): Statement {
  const statement = Object.assign({}, memo);

  try {
    switch (getSection(line)) {
      case StatementSection.Account:
        const [header, accountNumber, accountNickname] = line.split(",");
        statement.account = accountNumber.trim();
        statement.bank = Banks.FNB;
        break;

      case StatementSection.Transaction:
        statement.transactions.push(transactionFromFnbLineSections(line));
        break;
    }
  } catch (e) {
    statement.parsingErrors.push(e);
  }

  return statement;
}

function transactionFromFnbLineSections(line: string): Transaction {
  const [date, amount, balance, description] = line.split(",");

  return {
    description: description.trim(),
    amountInZAR: Number(amount),
    timeStamp: toTimestamp(date),
    hash: hash(line),
    balance: Number(balance),
  };
}

function toTimestamp(dateString: string): string {
  if (isNaN(Date.parse(dateString))) {
    throw `Cannot convert to timestamp: ${dateString}`;
  }

  const date = new Date(dateString);
  return moment(date.toISOString()).format();
}

enum StatementSection {
  Name,
  Account,
  Balance,
  Transaction,
  Unknown,
}

const getSection = (line: string) => {
  if (line.startsWith("Name")) {
    return StatementSection.Name;
  }
  if (line.startsWith("Account")) {
    return StatementSection.Account;
  }
  if (line.startsWith("Balance")) {
    return StatementSection.Balance;
  }

  const firstToken = line.split(",", 1)[0];
  const transactionDate = Date.parse(firstToken);
  if (!isNaN(transactionDate)) {
    return StatementSection.Transaction;
  }

  return StatementSection.Unknown;
};
