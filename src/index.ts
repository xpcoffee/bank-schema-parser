import * as program from "commander";
import parseFnbStatment from "./fnb";
import { Params } from "./types";
import { getStatementParser } from "./statement";

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

const parse = getStatementParser(parseFnbStatment);
const printJson = (s: {}) => console.log("%j", s);

parse(params.statementFile)
  .then(printJson)
  .catch(console.error);
