import * as fs from "fs";
import * as readline from "readline";
import { Statement, ParsingFunction, StatementParser } from "./types";

export const UKNOWN = "UNKNOWN";

export function getEmptyStatement(): Statement {
  return {
    account: UKNOWN,
    bank: UKNOWN,
    transactions: [],
    parsingErrors: []
  };
}

export function getStatementParser<T>(
  parsingFunction: ParsingFunction
): StatementParser {
  return async (file: string) => {
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let memo = getEmptyStatement();
    for await (const line of rl) {
      memo = parsingFunction(line, memo);
    }
    return memo;
  };
}
