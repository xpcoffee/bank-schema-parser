#!/usr/bin/env node
"use strict";

import * as program from "commander";

import { ParseFileParams, parseFromFile } from "./node-parser";

export function run(proc: NodeJS.Process) {
  // Parse command-line input
  program
    .version("1.0.0")
    .name("bank-schema-parser")
    .usage("--bank <bank> --filePath <filePath> [--type <type>]")
    .option("-b, --bank <bank>", "The bank who's statement will be parsed", /^(fnb|standardbank)$/i, false)
    .option("-f, --filePath <filePath>", "The path to the file that should be parsed")
    .option(
      "-t, --type <type>",
      "Use to specify the type of input file. Can be DEFAULT, TRANSACTION_HISTORY or HANDMADE. Uses DEFAULT if the option is unspecified.",
    )
    .parse(proc.argv);

  if (!program.bank && !program.filePath) {
    program.help();
  }

  if (!program.bank) {
    console.error("Invalid bank name. Type --help for more details.");
    proc.exit(1);
  }

  if (!program.filePath) {
    console.error("Invalid bank statement file. Type --help for more details.");
    proc.exit(1);
  }

  const params = (program as any) as CliParams;

  try {
    const printJson = (s: {}) => console.log("%j", s);

    parseFromFile({ bank: params.bank, type: params.type, filePath: params.filePath })
      .then(printJson)
      .catch(console.error);
  } catch (e) {
    console.error(`[ERROR] ${e}`);
  }

  interface CliParams extends ParseFileParams {}
}
