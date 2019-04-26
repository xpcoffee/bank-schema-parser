import { getEmptyStatement } from "../src/statement";
import deduplicate from "../src/deduplicate";

describe("deduplicate", () => {
  it("should deduplicate entries by modifying the hash", () => {
    const statement = getEmptyStatement();
    const txn = {
      timeStamp: "foo",
      description: "bar",
      amountInZAR: 20,
      hash: 1234,
    };

    statement.transactions.push(txn);
    statement.transactions.push(txn);

    const dedup = deduplicate(statement);
    const first = dedup.transactions.filter(txn => txn.hash.toString() === "1234");
    const second = dedup.transactions.filter(txn => txn.hash.toString() === "1234D");

    expect(first).toBeTruthy();
    expect(first.length).toEqual(1);
    expect(second).toBeTruthy();
    expect(second.length).toEqual(1);
  });
});
