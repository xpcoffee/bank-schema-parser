import { Banks, ParsingFunction, Statement, Transaction, Currencies } from "../types";
import hash from "../hash";
import { DateTime } from "luxon";
import { PassThrough } from "stream";

/**
 * Parses statements that are "handmade" i.e. that have been created from PDF statements.
 * PDF statements have fewer overall fields, but more transaction information that regular statements
 * (notably the transactions contain balances), so a different function is required to parse them.
 */
const parse: ParsingFunction = function (memo: Statement, line: string): Statement {
  const statement = Object.assign({}, memo);

  switch (getSection(line)) {
    case Section.Account:
      statement.account = getAccount(line);
      statement.bank = Banks.StandardBank;
      break;

    case Section.Transaction:
      statement.transactions.push(toTransaction(line));
      break;
  }

  return statement;
};

enum Section {
  Account,
  Header,
  Transaction,
  Unknown,
}

function getSection(line: string): Section {
  if (line.startsWith("ACCOUNT")) {
    return Section.Account;
  }
  if (line.startsWith("HEADER")) {
    return Section.Header;
  }
  if (line.startsWith("HIST")) {
    return Section.Transaction;
  }
  return Section.Unknown;
}

function getAccount(line: string): string {
  return line.split(",")[1];
}

function toTransaction(line: string): Transaction {
  const [section, desc, amount, date, balance] = line.split(",");

  return {
    description: desc,
    balance: Number(balance),
    amount: Number(amount),
    currency: Currencies.SouthAfricaRand,
    timeStamp: toTimestamp(date),
    /**
     * [NB]: We do not include the balance in the hash: normal statements do not
     * contain balances at a transaction level; we want transactions from handmade
     * statements to still be idempotent with transactions in regular statements.
     */
    hash: hash([section, desc, amount, date].join(",")),
  };
}

function toTimestamp(dateString: string): string {
  const parsedDate = DateTime.fromFormat(dateString, "yyyy-MM-dd");

  if (parsedDate.invalidReason) {
    throw `Could not parse "${dateString}" into timestamp. ${parsedDate.invalidExplanation}`;
  }

  return parsedDate.toISO({ suppressMilliseconds: true });
}

export default {
  fileType: "StandardBank-Handmade" as const,
  parse,
};
