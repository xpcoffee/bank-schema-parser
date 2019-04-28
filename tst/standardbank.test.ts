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
});
