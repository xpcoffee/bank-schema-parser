import { Statement, Transaction } from "./types";
import moment = require("moment");

const STANDARD_BANK = "StandardBank";

/**
 * Function with which to parse a line from StandardBank statement.
 *
 * @param line - the line to parse
 * @param memo - the statement with which the parsed data should be combined
 * @returns statement - the statement with more data parsed in
 */
export default function(line: string, memo: Statement): Statement {
  const statement = Object.assign({}, memo);

  try {
    switch (sectionType(line)) {
      case Section.AccountNumber:
        statement.account = getAccountNumber(line);
        statement.bank = STANDARD_BANK;
        break;

      case Section.Transaction:
        statement.transactions.push(toTransaction(line));
        break;
    }
  } catch (e) {
    statement.parsingErrors.push(e);
  }

  return statement;
}

enum Section {
  AccountNumber,
  Transaction,
  Unknown,
}

const sectionType = (line: string): Section => {
  if (line.includes("ACC-NO")) {
    return Section.AccountNumber;
  }
  if (line.startsWith("HIST")) {
    return Section.Transaction;
  }
  return Section.Unknown;
};

const getAccountNumber = (line: string): string => line.split(",")[1];

const toTransaction = (line: string): Transaction => {
  const lineSections = transactionLine(line.split(","));

  return {
    amountInZAR: Number(lineSections.amount),
    description: lineSections.description,
    timeStamp: toTimeStamp(toDateString(lineSections.dateString)),
  };
};

const toTimeStamp = (dateString: string) => moment(dateString).format();

const toDateString = (standardBankDateString: string): string =>
  [standardBankDateString.slice(0, 4), standardBankDateString.slice(4, 6), standardBankDateString.slice(6)].join("-");

const transactionLine = (lineSections: string[]) => ({
  dateString: lineSections[1],
  unknown: lineSections[2],
  amount: lineSections[3],
  transactionType: lineSections[4],
  description: lineSections[5],
  code: lineSections[6],
  unknown2: lineSections[7],
});
