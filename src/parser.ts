import { getEmptyStatement } from "./statement";
import statementDefinitions, { FileType } from "./statement-definitions";
import dedupe from "./deduplicate";
import { Statement } from "./types";

/**
 * Parses a file string into a statement
 */
export function parseFromString({
  fileType,
  inputString,
  deduplicateTransactions,
}: ParseStringParams): Promise<Statement> {
  const lines = getStatementLinesFromString(inputString);
  const fn = getStatementParser(getParseFn(fileType), lines);
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
export const getParseFn = (fileType: FileType): ParsingFunction => {
  const fn = statementDefinitions[fileType];
  if (fn) {
    return fn;
  }

  throw `Unknown file type ${fileType}`;
};

export interface ParseParams {
  fileType: FileType;
  deduplicateTransactions?: boolean;
}

export type StatementParser = (file: string) => Promise<Statement>;
export type ParsingFunction = (line: string, memo: Statement) => Statement;
