import { getEmptyStatement } from "../src/statement";
import { deduplicateTransactions } from "../src/deduplicate";
import { Currencies } from "../src/types";

describe("deduplicate", () => {
  it("should deduplicate entries by modifying the hash", () => {
    const statement = getEmptyStatement();
    const txn = {
      timeStamp: "foo",
      description: "bar",
      amount: 20,
      currency: Currencies.SouthAfricaRand,
      hash: "1234",
      balance: 10,
    };

    statement.transactions.push(txn);
    statement.transactions.push(txn);
    statement.transactions.push(txn);

    const dedup = deduplicateTransactions(statement);
    const first = dedup.transactions.filter((txn) => txn.hash.toString() === "1234");
    const second = dedup.transactions.filter((txn) => txn.hash.toString() === "1234D");
    const third = dedup.transactions.filter((txn) => txn.hash.toString() === "1234DD");

    expect(first.length).toEqual(1);
    expect(second.length).toEqual(1);
    expect(third.length).toEqual(1);
  });
});
