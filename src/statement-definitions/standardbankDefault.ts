import { Banks, ParsingFunction, Statement, Transaction } from "../types";
import * as moment from "moment";
import hash from "../hash";

/**
 * Parses a line from StandardBank statement.
 *
 * @param line - the line to parse
 * @param memo - the statement with which the parsed data should be combined
 * @returns statement - the statement with more data parsed in
 */
const parse: ParsingFunction = (memo: StandardBankStatement, line: string): StandardBankStatement => {
  const statement = Object.assign({}, memo);

  try {
    switch (sectionType(line)) {
      case Section.AccountNumber:
        statement.account = getAccountNumber(line);
        statement.bank = Banks.StandardBank;
        break;
      case Section.OpeningBalance:
        statement.runningBalance = getBalance(line);
        break;

      case Section.Transaction:
        if (statement.runningBalance === undefined) {
          throw "No running balance on statement - cannot infer balance for transaction.";
        }
        const txn = toTransaction(line, statement.runningBalance);
        statement.transactions.push(txn);
        statement.runningBalance = txn.balance;
        break;

      case Section.ClosingBalance:
        const expectedBalance = getBalance(line);
        if (statement.runningBalance !== expectedBalance) {
          statement.parsingErrors.push(
            `[SANITY CHECK][ERROR] Expected balance: ${expectedBalance} | Actual balance: ${statement.runningBalance}`,
          );
        }
    }
  } catch (e) {
    statement.parsingErrors.push(e);
  }

  return statement;
};

export interface StandardBankStatement extends Statement {
  runningBalance?: number;
}

enum Section {
  AccountNumber,
  OpeningBalance,
  Transaction,
  ClosingBalance,
  Unknown,
}

const sectionType = (line: string): Section => {
  if (line.includes("ACC-NO")) {
    return Section.AccountNumber;
  }
  if (line.startsWith("HIST")) {
    return Section.Transaction;
  }
  if (line.startsWith(",0,OPEN")) {
    return Section.OpeningBalance;
  }
  if (line.startsWith(",0,CLOSE")) {
    return Section.ClosingBalance;
  }
  return Section.Unknown;
};

const getAccountNumber = (line: string): string => line.split(",")[1];

const getBalance = (line: string): number => Number(line.split(",")[3]);

const toTransaction = (line: string, currentBalance: number): Transaction => {
  const [section, stdBankDateString, unknown, amountStr, transactionType, description, code, unknown2] = line.split(
    ",",
  );

  const amount = Number(amountStr);
  const newBalance = add(currentBalance, amount);

  return {
    amountInZAR: amount,
    description: description,
    timeStamp: toTimeStamp(toDateString(stdBankDateString)),
    /**
     * [NB!] The hash must not contain the balance - this would break idempotency.
     * We infer the balance for StandardBank in a way that is order dependent,
     * so it could differ if we parse 2 different statements that contain the same txns.
     */

    hash: hash(line),
    balance: newBalance,
  };
};

/**
 * Adds two decimal numbers
 *
 * Javascript represents numbers in binary, which has rounding errors when dealing with decimals.
 */
const add = (a: number, b: number) => (100 * a + 100 * b) / 100;

const toTimeStamp = (dateString: string) => moment(dateString).format();

const toDateString = (standardBankDateString: string): string =>
  [standardBankDateString.slice(0, 4), standardBankDateString.slice(4, 6), standardBankDateString.slice(6)].join("-");

export default {
  fileType: "StandardBank-Default" as const,
  parse,
};
