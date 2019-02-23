import * as cli from "commander";

cli
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

if (!cli.bank) {
  console.error("Invalid bank name. Type --help for more details.");
  process.exit(1);
}

if (!cli.statementFile) {
  console.error("Invalid bank statement file. Type --help for more details.");
  process.exit(1);
}

interface Params {
  bank: string;
  statementFile: string;
}

function greeter({ bank, statementFile }: Params) {
  return "Bank: " + bank + ", File: " + statementFile;
}

const params = (cli as any) as Params;
console.log(greeter(params));
