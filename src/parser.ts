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
 * Parses a file given into a statement
 */
export function parseFromFile({
  bank,
  type = InputFileTypes.Default,
  filePath,
  deduplicateTransactions,
}: ParseFileParams): Promise<Statement> {
  const lines = getStatementLinesFromFile(filePath);
  const fn = getStatementParser(getParseFn({ bank, type }), lines);
  const result = fn(filePath);
  return deduplicateTransactions ? result.then(dedupe) : result;
}
export interface ParseFileParams extends ParseParams {
  filePath: string;
}

/**
 * Parses a file string into a statement
 */
export function parseFromString({
  bank,
  type = InputFileTypes.Default,
  inputString,
  deduplicateTransactions,
}: ParseStringParams): Promise<Statement> {
  const lines = getStatementLinesFromString(inputString);
  const fn = getStatementParser(getParseFn({ bank, type }), lines);
  const result = fn(inputString);
  return deduplicateTransactions ? result.then(dedupe) : result;
}
export interface ParseStringParams extends ParseParams {
  inputString: string;
}

/**
 * Given a line-parsing function, this returns a function that will parse a the file at a given path.
 *
 * @param parsingFunction The function to use to parse each line of the file.
 * @returns a function that, given a path to a file, will parse the file into a Statement object.
 */
export function getStatementParser(
  parsingFunction: ParsingFunction,
  statementLines: AsyncGenerator<string>,
): StatementParser {
  return async function parseStatement() {
    let memo = getEmptyStatement();
    for await (const line of statementLines) {
      memo = parsingFunction(line, memo);
    }
    return memo;
  };
}

/**
 * Reads a file and yields each line of the file
 */
export async function* getStatementLinesFromFile(filePath: string) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    yield line;
  }
}

/**
 * Yields each line of a string
 */
export async function* getStatementLinesFromString(statement: string) {
  const lines = statement.split("\n");
  for await (const line of lines) {
    yield line;
  }
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
  type: string;
  deduplicateTransactions?: boolean;
}

export type StatementParser = (file: string) => Promise<Statement>;
export type ParsingFunction = (line: string, memo: Statement) => Statement;
