import * as moment from "moment";
import { Statement, Transaction } from "./types";

const STATEMENT_SECTIONS = {
  ACCOUNT_DETAILS: "2",
  STATEMENT_INFO: "3",
  SUMMARY: "4",
  TRANSACTIONS: "5",
  END: "6"
};

const ACCOUNT_DETAILS_SECTIONS = {
  STATEMENT_SECTION_NUMBER: 0,
  ACCOUNT_NUMBER: 1,
  NAME: 2,
  TYPE: 3
};

const TRANSACTION_SECTIONS = {
  STATEMENT_SECTION_NUMBER: 0,
  TRANSACTION_NUMBER: 1,
  DATE: 2,
  TYPE: 3,
  DESCRIPTION: 4,
  OBTUSE_DESCRIPTION: 5,
  AMOUNT: 6,
  BALANCE: 7,
  ACCRUED_CHARGES: 8
};

function transactionFromFnbLineSections(lineSections: string[]): Transaction {
  return {
    description: lineSections[TRANSACTION_SECTIONS.DESCRIPTION],
    amountInZAR: parseFloat(lineSections[TRANSACTION_SECTIONS.AMOUNT]),
    timeStamp: toTimestamp(lineSections[TRANSACTION_SECTIONS.DATE])
  };
}

function toTimestamp(date: string): string {
  return moment(new Date(date).toISOString()).format();
}

export default function(line: string, memo: Statement): Statement {
  const statement = Object.assign({}, memo);
  const lineSections = line.split(",");

  switch (lineSections[TRANSACTION_SECTIONS.STATEMENT_SECTION_NUMBER]) {
    case STATEMENT_SECTIONS.ACCOUNT_DETAILS:
      statement.account = lineSections[ACCOUNT_DETAILS_SECTIONS.ACCOUNT_NUMBER];
      statement.bank = "FNB";
      break;

    case STATEMENT_SECTIONS.TRANSACTIONS:
      try {
        statement.transactions.push(
          transactionFromFnbLineSections(lineSections)
        );
      } catch {
        // fail silently
      }
      break;
  }
  return statement;
}
