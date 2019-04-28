import { getEmptyStatement } from "../src/statement";
import standardbank, { StandardBankStatement } from "../src/standardbank";

describe("standardbank", () => {
  it("parses a transaction from a statement", () => {
    const transactionLine = "HIST,20181121,,-150,IB PAYMENT FROM,bar,1234,0";

    const statement: StandardBankStatement = getEmptyStatement();
    statement.runningBalance = 100;
    const parsedTransaction = standardbank(transactionLine, statement).transactions[0];

    expect(parsedTransaction.amountInZAR).toEqual(-150);
    expect(parsedTransaction.description).toEqual("bar");
    expect(parsedTransaction.timeStamp).toEqual("2018-11-21T00:00:00+02:00");
    expect(parsedTransaction.balance).toEqual(-50);
  });

  it("calculates a running balance for each transaction", () => {
    const lines = [
      ",0,OPEN,1000,OPEN BALANCE,,0,0",
      "HIST,20181121,,200.22,IB PAYMENT FROM,foo,1234,0",
      "HIST,20181121,,-100.01,IB PAYMENT FROM,bar,1234,0",
    ];

    let statement: StandardBankStatement = getEmptyStatement();
    lines.forEach(line => (statement = standardbank(line, statement)));

    expect(statement.runningBalance).toEqual(1100.21);
  });
});
