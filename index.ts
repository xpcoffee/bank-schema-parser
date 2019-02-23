import * as cli from "commander";

cli
  .version("1.0.0")
  .option(
    "-b, --bank <bank>",
    "The bank who's statement will be parsed",
    /^(fnb|standardbank)$/i,
    false
  )
  .parse(process.argv);

if (!cli.bank) {
  console.error("Invalid bank name. Type --help for more details.");
  process.exit(1);
}

function greeter(person) {
  return "Hello " + person + "!";
}

console.log(greeter(cli.bank));
