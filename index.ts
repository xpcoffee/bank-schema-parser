import * as cli from "commander";

cli
  .version("1.0.0")
  .option("-p, --person <name>", "The person to greet")
  .parse(process.argv);

function greeter(person) {
  return "Hello " + person + "!";
}

console.log(greeter(cli.person));
