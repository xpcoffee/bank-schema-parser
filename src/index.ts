import * as program from "commander";
import * as fs from "fs";
import * as readline from "readline";
import parseFnbStatment from "./fnb";
import { Params, Statement, StatementParser, ParsingFunction } from "./types";

// Parse command-line input
program
  .version("1.0.0")
  .usage("--bank <bank> --statement-file <file>")
  .option(
    "-b, --bank <bank>",
    "The bank who's statement will be parsed",
    /^(fnb|standardbank)$/i,
    false
  )
  .option("-f, --statement-file <file>", "The bank statement file to be parsed")
  .parse(process.argv);

if (!program.bank) {
  console.error("Invalid bank name. Type --help for more details.");
  process.exit(1);
}

if (!program.statementFile) {
  console.error("Invalid bank statement file. Type --help for more details.");
  process.exit(1);
}

const params = (program as any) as Params;

const UKNOWN = "UNKNOWN";
function getEmptyStatement(): Statement {
  return {
    account: UKNOWN,
    bank: UKNOWN,
    transactions: []
  };
}

function getStatementParser<T>(
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

const parse = getStatementParser(parseFnbStatment);

parse(params.statementFile).then(s => console.log("%j", s));
