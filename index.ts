import * as program from "commander";
import * as readline from "readline";
import * as moment from "moment";
import * as fs from "fs";
import { Params, Transaction, Statement } from "./types";
import {
  TRANSACTION_SECTIONS,
  STATEMENT_SECTIONS,
  ACCOUNT_DETAILS_SECTIONS
} from "./fnb";

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

// Parsing logic
function parseFnbStatmentLine(line: string, memo: Statement): Statement {
  const lineSections = line.split(",");

  switch (lineSections[TRANSACTION_SECTIONS.STATEMENT_SECTION_NUMBER]) {
    case STATEMENT_SECTIONS.ACCOUNT_DETAILS:
      memo.account = lineSections[ACCOUNT_DETAILS_SECTIONS.ACCOUNT_NUMBER];
      memo.bank = "FNB";
      break;
    case STATEMENT_SECTIONS.TRANSACTIONS:
      try {
        memo.transactions.push(transactionFromFnbLineSections(lineSections));
      } catch {
        // fail silently
      }
      break;
  }
  return memo;
}

function transactionFromFnbLineSections(lineSections: string[]): Transaction {
  return {
    description: lineSections[TRANSACTION_SECTIONS.DESCRIPTION],
    amountInZAR: parseFloat(lineSections[TRANSACTION_SECTIONS.AMOUNT]),
    timeStamp: toTimestamp(lineSections[TRANSACTION_SECTIONS.DATE])
  };
}

function toTimestamp(date: string): string {
  return moment(new Date(date).toISOString()).format();
}

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
  parseFnbStatmentLine(line, statement);
}).on("close", () => console.log("%j", statement));
