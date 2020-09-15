#!/usr/bin/env node
"use strict";

import * as program from "commander";

import { ParseFileParams, parseFromFile } from "./node-parser";
import { fileTypes } from "./statement-definitions";

export function run(proc: NodeJS.Process) {
  // Parse command-line input
  program
    .version("1.0.0")
    .name("bank-schema-parser")
    .usage("--fileType <fileType> --filePath <filePath>")
    .option("-t, --fileType <fileType>", "The type of input file. Valid file types are: " + fileTypes.join(" "))
    .option("-f, --filePath <filePath>", "The path to the file that should be parsed")
    .parse(proc.argv);

  if (!program.fileType && !program.filePath) {
    program.help();
  }

  if (!program.fileType) {
    console.error("You must specify a file type. Type --help for more details.");
    proc.exit(1);
  }

  if (!program.filePath) {
    console.error("You must specify a file path. Type --help for more details.");
    proc.exit(1);
  }

  const params = (program as any) as CliParams;

  try {
    const printJson = (s: {}) => console.log("%j", s);

    parseFromFile({ fileType: params.fileType, filePath: params.filePath }).then(printJson).catch(console.error);
  } catch (e) {
    console.error(`[ERROR] ${e}`);
  }

  interface CliParams extends ParseFileParams {}
}
