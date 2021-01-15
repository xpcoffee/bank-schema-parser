import { validateTransaction } from "@xpcoffee/bank-schema";
import { getEmptyStatement } from "../src/statement";
import definition from "../src/statement-definitions/fnbTransactionHistory";
import { Statement, Currencies } from "../src/types";

describe("fnb", () => {
  it("parses a transaction from a statement", () => {
    const transactionLine = `2019/08/01, -438.00, 82875.21, VIRGIN ACT4003863716:169314`;
    const statement: Statement = getEmptyStatement();
    const parsedTransaction = definition.parse(statement, transactionLine).transactions[0];

    expect(statement.parsingErrors).toEqual([]);
    expect(validateTransaction(parsedTransaction).errors).toEqual([]);
    expect(parsedTransaction.amount).toEqual(-438);
    expect(parsedTransaction.currency).toEqual(Currencies.SouthAfricaRand);
    expect(parsedTransaction.description).toEqual("VIRGIN ACT4003863716:169314");
    expect(parsedTransaction.timeStamp).toEqual("2019-08-01T00:00:00+02:00");
  });
});
