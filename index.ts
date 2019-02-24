import * as program from "commander";
import * as fs from "fs";
import * as readline from "readline";
import parseFnbStatment from "./fnb";
import { Params, Statement } from "./types";

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

// Read bank statement contents
const fileStream = fs.createReadStream(params.statementFile);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

const statement: Statement = {
  account: undefined,
  bank: undefined,
  transactions: []
};

rl.on("line", line => {
  parseFnbStatment(line, statement);
}).on("close", () => console.log("%j", statement));
