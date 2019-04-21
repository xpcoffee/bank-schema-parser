import * as moment from "moment";
import { Statement, Transaction } from "./types";

const FNB = "FNB";

/**
 * Function with which to parse a line from an FNB statement.
 *
 * @param line - the line to parse
 * @param memo - the statement with which the parsed data should be combined
 * @returns statement - the statement with more data parsed in
 */
export default function(line: string, memo: FnbStatement): FnbStatement {
  const statement = Object.assign({}, memo);
  const lineSections = line.split(",");

  switch (lineSections[STATEMENT_SECTION_NUMBER]) {
    case STATEMENT_SECTIONS.ACCOUNT_DETAILS:
      const account = accountDetails(lineSections);
      statement.account = account.accountNumber;
      statement.bank = FNB;
      break;

    case STATEMENT_SECTIONS.STATEMENT_INFO:
      const info = statementInfo(lineSections);

      if (info.fromDate && info.toDate) {
        const startDate = Date.parse(info.fromDate);
        if (!isNaN(startDate)) {
          statement.startDate = new Date(startDate);
        }

        const endDate = Date.parse(info.toDate);
        if (!isNaN(endDate)) {
          statement.endDate = new Date(endDate);
        }
      }
      break;

    case STATEMENT_SECTIONS.TRANSACTIONS:
      if (statement.startDate === undefined) {
        throw "No start date found in the statement! Cannot infer dates.";
      }

      if (statement.endDate === undefined) {
        throw "No end date found in the statement! Cannot infer dates.";
      }

      try {
        statement.transactions.push(
          transactionFromFnbLineSections(
            lineSections,
            statement.startDate,
            statement.endDate
          )
        );
      } catch (e) {
        statement.parsingErrors.push(e);
      }
      break;
  }
  return statement;
}

function transactionFromFnbLineSections(
  lineSections: string[],
  startDate: Date,
  endDate: Date
): Transaction {
  const line = transaction(lineSections);

  return {
    description: line.description.replace(/"/g, ""),
    amountInZAR: parseFloat(line.amount),
    timeStamp: toTimestamp(line.date, startDate, endDate)
  };
}

function toTimestamp(
  dateString: string,
  startDate: Date,
  endDate: Date
): string {
  if (isNaN(Date.parse(dateString))) {
    throw `Cannot convert to timestamp: ${dateString}`;
  }

  const date = new Date(dateString);

  // FNB dates in transactions don't contain the year - we need to add the correct year
  // 1. start by assigning the startDate year
  date.setFullYear(startDate.getFullYear());

  // 2.increase the year if the date doesn't fall in the statment's date range
  while (!(date >= startDate && date <= endDate)) {
    date.setFullYear(date.getFullYear() + 1);
  }

  return moment(date.toISOString()).format();
}

export interface FnbStatement extends Statement {
  startDate?: Date;
  endDate?: Date;
}

export const STATEMENT_SECTIONS = {
  ACCOUNT_DETAILS: "2",
  STATEMENT_INFO: "3",
  SUMMARY: "4",
  TRANSACTIONS: "5",
  END: "6"
};

// Index of line section that gives tells us what section we're in
const STATEMENT_SECTION_NUMBER = 0;

const accountDetails = (lineSections: string[]) => ({
  accountNumber: lineSections[1],
  name: lineSections[2],
  type: lineSections[3]
});

const statementInfo = (lineSections: string[]) => ({
  statementNumber: lineSections[1],
  fromDate: lineSections[2],
  toDate: lineSections[3],
  openingBalance: lineSections[4],
  closingBalance: lineSections[5],
  vatPaid: lineSections[6]
});

const transaction = (lineSections: string[]) => ({
  transactionNumber: lineSections[1],
  date: lineSections[2],
  type: lineSections[3],
  description: lineSections[4],
  obtuseDescription: lineSections[5],
  amount: lineSections[6],
  balance: lineSections[7],
  accruedCharges: lineSections[8]
});
