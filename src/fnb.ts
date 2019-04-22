import * as moment from "moment";
import { Statement, Transaction } from "./types";
import hash from "./hash";

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

  try {
    switch (getSection(line)) {
      case StatementSection.AccountDetails:
        const account = accountDetailsLine(line.split(","));
        statement.account = account.accountNumber;
        statement.bank = FNB;
        break;

      case StatementSection.StatementInfo:
        const info = statementInfoLine(line.split(","));

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

      case StatementSection.Transaction:
        if (statement.startDate === undefined) {
          throw "No start date found in the statement! Cannot infer dates.";
        }

        if (statement.endDate === undefined) {
          throw "No end date found in the statement! Cannot infer dates.";
        }

        statement.transactions.push(transactionFromFnbLineSections(line, statement.startDate, statement.endDate));
        break;
    }
  } catch (e) {
    statement.parsingErrors.push(e);
  }

  return statement;
}

function transactionFromFnbLineSections(line: string, startDate: Date, endDate: Date): Transaction {
  const lineSections = transactionLine(line.split(","));

  return {
    description: lineSections.description.replace(/"/g, ""),
    amountInZAR: parseFloat(lineSections.amount),
    timeStamp: toTimestamp(lineSections.date, startDate, endDate),
    hash: hash(line),
  };
}

function toTimestamp(dateString: string, startDate: Date, endDate: Date): string {
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

enum StatementSection {
  AccountDetails,
  StatementInfo,
  Summary,
  Transaction,
  End,
  Unknown,
}

const getSection = (line: string) => {
  if (line.startsWith("2")) {
    return StatementSection.AccountDetails;
  }
  if (line.startsWith("3")) {
    return StatementSection.StatementInfo;
  }
  if (line.startsWith("4")) {
    return StatementSection.Summary;
  }
  if (line.startsWith("5")) {
    return StatementSection.Transaction;
  }
  if (line.startsWith("6")) {
    return StatementSection.End;
  }

  return StatementSection.Unknown;
};

const accountDetailsLine = (lineSections: string[]) => ({
  accountNumber: lineSections[1],
  name: lineSections[2],
  type: lineSections[3],
});

const statementInfoLine = (lineSections: string[]) => ({
  statementNumber: lineSections[1],
  fromDate: lineSections[2],
  toDate: lineSections[3],
  openingBalance: lineSections[4],
  closingBalance: lineSections[5],
  vatPaid: lineSections[6],
});

const transactionLine = (lineSections: string[]) => ({
  transactionNumber: lineSections[1],
  date: lineSections[2],
  type: lineSections[3],
  description: lineSections[4],
  obtuseDescription: lineSections[5],
  amount: lineSections[6],
  balance: lineSections[7],
  accruedCharges: lineSections[8],
});
