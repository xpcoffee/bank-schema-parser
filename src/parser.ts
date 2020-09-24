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
  const lines = shouldParseWhole(fileType) ? getLineFromString(inputString) : getLinesFromString(inputString);
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
 * Creates a generator that yields the entirety of the given string
 */
export async function* getLineFromString(str: string) {
  yield str;
}

/**
 * Creats a generator that yields new each line of a string
 */
export async function* getLinesFromString(str: string) {
  const lines = str.split("\n");
  for (const line of lines) {
    yield line;
  }
}

/**
 * Determines if input should be parsed in its entirety (e.g. JSON input) or line-by-line (e.g. CSV input)
 */
function shouldParseWhole(fileType: FileType): boolean {
  switch (fileType) {
    case "bank-schema":
      return true;
    default:
      return false;
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
