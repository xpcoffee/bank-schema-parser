#!/usr/bin/env node
"use strict";

import * as program from "commander";

import { parseFnbStatement, parseFnbTransactionHistory, parseHandmadeStandardbankStatement, parseStandardbankStatement } from "./statement-definitions";
import { Params, ParsingFunction } from "./types";
import { getStatementParser } from "./statement";
import deduplicateTransactions from "./deduplicate";

// Parse command-line input
program
  .version("1.0.0")
  .usage("--bank <bank> --file <file> [--type <type>]")
  .option("-b, --bank <bank>", "The bank who's statement will be parsed", /^(fnb|standardbank)$/i, false)
  .option("-f, --file <file>", "The bank statement file to be parsed")
  .option(
    "-t, --type <type>",
    "Use to specify the type of input file. Can be DEFAULT, TRANSACTION_HISTORY or HANDMADE. Uses DEFAULT if the option is unspecified.",
  )
  .parse(process.argv);

if (!program.bank) {
  console.error("Invalid bank name. Type --help for more details.");
  process.exit(1);
}

if (!program.file) {
  console.error("Invalid bank statement file. Type --help for more details.");
  process.exit(1);
}

enum Banks {
  FNB = "fnb",
  StandardBank = "standardbank",
}
enum InputFileTypes {
  Default = "DEFAULT",
  Handmade = "HANDMADE",
  TransactionHistory = "TRANSACTION_HISTORY",
}
const params = (program as any) as Params;

/**
 * Factory function for getting a parsing function
 */
const getParseFn = ({ bank, type = InputFileTypes.Default }: { bank: string; type?: string }): ParsingFunction => {
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

try {
  const parse = getStatementParser(getParseFn({ bank: params.bank, type: params.type }));
  const printJson = (s: {}) => console.log("%j", s);

  parse(params.file).then(deduplicateTransactions).then(printJson).catch(console.error);
} catch (e) {
  console.error(`[ERROR] ${e}`);
}
