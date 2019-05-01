import * as program from "commander";
import parseFnbStatement from "./fnb";
import parseStandardbankStatement from "./standardbank";
import parseHandmadeStandardbankStatement from "./standardbankHandmade";
import { Params, ParsingFunction } from "./types";
import { getStatementParser } from "./statement";
import deduplicate from "./deduplicate";

// Parse command-line input
program
  .version("1.0.0")
  .usage("--bank <bank> --file <file> [--handmade]")
  .option("-b, --bank <bank>", "The bank who's statement will be parsed", /^(fnb|standardbank)$/i, false)
  .option("-f, --file <file>", "The bank statement file to be parsed")
  .option("--handmade", "Use for statements with the 'handmade' format")
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
const params = (program as any) as Params;

const getParseFn = (bank: string): ParsingFunction => {
  switch (bank) {
    case Banks.FNB:
      return parseFnbStatement;
    case Banks.StandardBank:
      return program.handmade ? parseHandmadeStandardbankStatement : parseStandardbankStatement;
  }

  throw `Uknown bank ${bank}`;
};

try {
  const parse = getStatementParser(getParseFn(params.bank));
  const printJson = (s: {}) => console.log("%j", s);

  parse(params.file)
    .then(deduplicate)
    .then(printJson)
    .catch(console.error);
} catch (e) {
  console.error(`[ERROR] ${e}`);
}
