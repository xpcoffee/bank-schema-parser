import { validateTransaction } from "@xpcoffee/bank-schema";
import { getEmptyStatement } from "../src/statement";
import definition from "../src/statement-definitions/standardbankHandmade";
import { Currencies } from "../src/types";

describe("standardBankHandmade", () => {
  it("extracts the account name", () => {
    const line = "ACCOUNT,10092563862,,,";

    const statement = definition.parse(getEmptyStatement(), line);
    expect(statement.account).toEqual("10092563862");
  });

  it("parses the transactions", () => {
    const line = "HIST,MAGTAPE CREDIT TEST TRANSFER,500.00,2017-07-26,130500.00";
    const transaction = definition.parse(getEmptyStatement(), line).transactions[0];

    console.log(transaction);
    expect(validateTransaction(transaction).errors).toEqual([]);
    expect(transaction.amount).toEqual(500);
    expect(transaction.currency).toEqual(Currencies.SouthAfricaRand);
    expect(transaction.balance).toEqual(130500);
    expect(transaction.description).toEqual("MAGTAPE CREDIT TEST TRANSFER");
    expect(transaction.timeStamp).toEqual("2017-07-26T00:00:00+02:00");
  });
});
