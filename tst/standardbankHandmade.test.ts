import { validateTransaction } from "bank-schema";
import standardBank from "../src/statement-definitions/standardbankHandmade";
import { getEmptyStatement } from "../src/statement";

describe("standardBankBackfill", () => {
  it("extracts the account name", () => {
    const line = "ACCOUNT,10092563862,,,";

    const statement = standardBank.parse(line, getEmptyStatement());
    expect(statement.account).toEqual("10092563862");
  });

  it("parses the transactions", () => {
    const line = "HIST,MAGTAPE CREDIT TEST TRANSFER,500.00,2017-07-26,130500.00";
    const transaction = standardBank.parse(line, getEmptyStatement()).transactions[0];

    expect(validateTransaction(transaction).valid).toBeTruthy();
    expect(transaction.amountInZAR).toEqual(500);
    expect(transaction.balance).toEqual(130500);
    expect(transaction.description).toEqual("MAGTAPE CREDIT TEST TRANSFER");
    expect(transaction.timeStamp).toEqual("2017-07-26T00:00:00+02:00");
  });
});
