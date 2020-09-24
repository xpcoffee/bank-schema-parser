import { getEmptyStatement } from "../src/statement";
import definition from "../src/statement-definitions/bankSchema";

describe("bank-schema", () => {
  const bankSchemaJsonString =
    '{"bank": "foo", "account": "bar", "transactions": [ { "hash":"foobarbaz", "amountInZAR": 15.2, "description": "baz", "timeStamp":"2020-09-01T15:00:00Z", "balance": 0 }]}';

  it("parses a statement from a single string", () => {
    const result = definition.parse(getEmptyStatement(), bankSchemaJsonString);

    expect(result.parsingErrors).toBe(undefined);
    expect(Object.isFrozen(result)).toBe(true);

    expect(result.bank).toEqual("foo");
    expect(result.account).toEqual("bar");

    expect(result.transactions).toHaveLength(1);
    const transaction = result.transactions[0];
    expect(transaction.hash).toEqual("foobarbaz");
    expect(transaction.amountInZAR).toEqual(15.2);
    expect(transaction.balance).toEqual(0);
    expect(transaction.description).toEqual("baz");
    expect(transaction.timeStamp).toEqual("2020-09-01T15:00:00Z");
  });

  it("raises a warning when parsing multiple times", () => {
    const result = [bankSchemaJsonString, "some other line"].reduce(definition.parse, getEmptyStatement());

    expect(result.parsingErrors).toHaveLength(1);
  });
});
