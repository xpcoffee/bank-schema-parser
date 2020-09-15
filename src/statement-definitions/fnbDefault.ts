import * as moment from "moment";
import { Banks, Statement, Transaction } from "..";
import hash from "../hash";

/**
 * Function with which to parse a line from an FNB statement.
 *
 * @param line - the line to parse
 * @param memo - the statement with which the parsed data should be combined
 * @returns statement - the statement with more data parsed in
 */
function parse(line: string, memo: FnbStatement): FnbStatement {
  const statement = Object.assign({}, memo);

  try {
    switch (getSection(line)) {
      case StatementSection.AccountDetails:
        const [accSection, accountNumber, name, type] = line.split(",");
        statement.account = accountNumber;
        statement.bank = Banks.FNB;
        break;

      case StatementSection.StatementInfo:
        const [stmtSection, statementNumber, fromDate, toDate, openingBalance, closingBalance, vatPaid] = line.split(
          ",",
        );

        if (fromDate && toDate) {
          const startDate = Date.parse(fromDate);
          if (!isNaN(startDate)) {
            statement.startDate = new Date(startDate);
          }

          const endDate = Date.parse(toDate);
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

        if (statement.startDate > statement.endDate) {
          throw "Start date cannot be greater than the end date!";
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
  const [
    section,
    transactionNumber,
    date,
    type,
    description,
    obtuseDescription,
    amount,
    balance,
    accruedCharges,
  ] = line.split(",");

  const cleanDescription = (description || "").replace(/"/g, "");
  const nonEmptyDescription = cleanDescription.length ? cleanDescription : (type || "").replace(/"/g, "");

  return {
    description: nonEmptyDescription,
    amountInZAR: Number(amount),
    timeStamp: toTimestamp(date, startDate, endDate),
    hash: hash(line),
    balance: Number(balance),
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

  // 2.increase the year if the date doesn't fall in the statement's date range
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

export default {
  fileType: "FNB-Default",
  parse,
} as const;
