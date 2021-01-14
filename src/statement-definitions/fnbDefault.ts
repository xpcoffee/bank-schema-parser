import { DateTime } from "luxon";
import { Banks, ParsingFunction, Statement, Transaction } from "../types";
import hash from "../hash";
import { tryExtractMessage } from "../errors";

/**
 * Function with which to parse a line from an FNB statement.
 *
 * @param line - the line to parse
 * @param memo - the statement with which the parsed data should be combined
 * @returns statement - the statement with more data parsed in
 */
const parse: ParsingFunction = (memo: FnbStatement, line: string): FnbStatement => {
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

        // skip header/empty lines
        if (!isTransactionHeaderRow(line) && line !== "") {
          statement.transactions.push(transactionFromFnbLineSections(line, statement.startDate, statement.endDate));
        }

        break;
    }
  } catch (e) {
    const message = tryExtractMessage(e);
    message && statement.parsingErrors.push(message);
  }

  return statement;
};

function isTransactionHeaderRow(line: string): boolean {
  return line.includes("'Transactions'") || line.includes("'Date'") || line === "5";
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
  const dateWithoutYear = DateTime.fromFormat((dateString || "").replace(/'/g, ""), "d MMM");
  if (dateWithoutYear.invalidReason) {
    throw `Could not parse "${dateString}" into timestamp. ${dateWithoutYear.invalidExplanation}`;
  }
  if (dateWithoutYear.invalidReason) {
    throw `Could not parse "${dateString}" into timestamp. ${dateWithoutYear.invalidExplanation}`;
  }
  const date = inferYear(dateWithoutYear, startDate, endDate);

  return date.toISO({ suppressMilliseconds: true });
}

// FNB dates in transactions don't contain the year - we need to infer the correct year
function inferYear(transactionDate: DateTime, startDate: Date, endDate: Date) {
  const startDateTime = DateTime.fromJSDate(startDate);
  const endDateTime = DateTime.fromJSDate(endDate);

  // Start with startDate year
  let date = transactionDate.set({ year: startDate.getFullYear() });

  /*
   * Increase the year if the date doesn't fall in the statement's date range
   *
   * This happens in cases where a statement crosses the boundary of a year e.g. from December to March.
   * For these cases, if you take a March transaction and use the start date's year you end up with
   * a date that falls before the start the statement period; the year needs to be increased.
   *
   * Here we make an assumption that this statement format won't span multiple years.
   */
  if (date < startDateTime || date > endDateTime) {
    date = date.set({ year: date.year + 1 });
  }

  return date;
}

export interface FnbStatement extends Statement {
  startDate?: Date;
  endDate?: Date;
}

/*
 * Defines the different sections of a default FNB statement
 * The sections contain different bits of information and need to be parsed separately.
 */
enum StatementSection {
  AccountDetails,
  StatementInfo,
  Summary,
  Transaction,
  End,
  Unknown,
}

/*
 * The FNB statement defines what section a line belongs to using a numerical prefix.
 * This is the mapping of those numbers to their sections.
 */
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
  fileType: "FNB-Default" as const,
  parse,
};
