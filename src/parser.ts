import * as fs from "fs";
import * as readline from "readline";
import { getEmptyStatement } from "./statement";
import {
  parseFnbStatement,
  parseFnbTransactionHistory,
  parseStandardbankStatement,
  parseHandmadeStandardbankStatement,
} from "./statement-definitions";
import dedupe from "./deduplicate";
import { Banks, InputFileTypes, Statement } from "./types";

/**
 * Parses a file given into a 
 */
export function parse({
  bank,
  type = InputFileTypes.Default,
  filePath,
  deduplicateTransactions: deduplicate,
}: {
  bank: string;
  type?: string;
  filePath: string;
  deduplicateTransactions?: boolean;
}): Promise<Statement> {
  const fn = getStatementParser(getParseFn({ bank, type }));
  const result = fn(filePath);
  return deduplicate ? result.then(dedupe) : result;
}

/**
 * Given a line-parsing function, this returns a function that will parse a the file at a given path.
 *
 * @param parsingFunction The function to use to parse each line of the file.
 * @returns a function that, given a path to a file, will parse the file into a Statement object.
 */
export function getStatementParser(parsingFunction: ParsingFunction): StatementParser {
  return async function parseStatement(filePath: string) {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    let memo = getEmptyStatement();
    for await (const line of rl) {
      memo = parsingFunction(line, memo);
    }
    return memo;
  };
}

/**
 * Factory function for getting a parsing function
 */
export const getParseFn = ({
  bank,
  type = InputFileTypes.Default,
}: {
  bank: string;
  type?: string;
}): ParsingFunction => {
  if (bank === Banks.FNB && type === InputFileTypes.Default) {
    return parseFnbStatement;
  }
  if (bank === Banks.FNB && type === InputFileTypes.TransactionHistory) {
    return parseFnbTransactionHistory;
  }
  if (bank === Banks.StandardBank && type === InputFileTypes.Default) {
    return parseStandardbankStatement;
  }
  if (bank === Banks.StandardBank && type === InputFileTypes.Handmade) {
    return parseHandmadeStandardbankStatement;
  }

  throw `Unknown bank ${bank}`;
};


export interface ParseParams {
  bank: string;
  file: string;
  type: string;
}

export type StatementParser = (file: string) => Promise<Statement>;
export type ParsingFunction = (line: string, memo: Statement) => Statement;
