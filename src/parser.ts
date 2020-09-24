import { getEmptyStatement } from "./statement";
import statementDefinitions, { FileType } from "./statement-definitions";
import { deduplicateTransactions as deduplicateFn } from "./deduplicate";
import { ParsingFunction, Statement, StatementParser } from "./types";
import { reduceAsync } from "./generators";

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
  return deduplicateTransactions ? result.then(deduplicateFn) : result;
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
    return await reduceAsync(statementLines, parsingFunction, getEmptyStatement());
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
