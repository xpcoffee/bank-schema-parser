import { validateTransaction } from "@xpcoffee/bank-schema";
import { getEmptyStatement } from "../src/statement";
import definition, { StandardBankStatement } from "../src/statement-definitions/standardbankDefault";
import { Currencies } from "../src/types";

describe("standardbank", () => {
  it("parses a transaction from a statement", () => {
    const transactionLine = "HIST,20181121,,-150,IB PAYMENT FROM,bar,1234,0";

    const statement: StandardBankStatement = getEmptyStatement();
    statement.runningBalance = 100;
    const parsedTransaction = definition.parse(statement, transactionLine).transactions[0];

    expect(statement.parsingErrors).toEqual([]);
    expect(validateTransaction(parsedTransaction).errors).toEqual([]);
    expect(parsedTransaction.timeStamp).toEqual("2018-11-21T00:00:00+02:00");
    expect(parsedTransaction.amount).toEqual(-150);
    expect(parsedTransaction.currency).toEqual(Currencies.SouthAfricaRand);
    expect(parsedTransaction.description).toEqual("bar");
    expect(parsedTransaction.balance).toEqual(-50);
  });

  it("calculates a running balance for each transaction", () => {
    const lines = [
      ",0,OPEN,1000,OPEN BALANCE,,0,0",
      "HIST,20181121,,200.22,IB PAYMENT FROM,foo,1234,0",
      "HIST,20181121,,-100.01,IB PAYMENT FROM,bar,1234,0",
    ];

    let statement: StandardBankStatement = getEmptyStatement();
    lines.forEach((line) => (statement = definition.parse(statement, line)));

    expect(statement.runningBalance).toEqual(1100.21);
  });
});
