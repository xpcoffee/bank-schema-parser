import { parseFromString } from "../src/parser";
describe("parseFromString", () => {
  it("successfully parses the a multiline string for bank-schema", async () => {
    const multiLineBankSchemaJsonString = `{
      "bank": "foo", 
      "account": "bar", 
      "transactions": [ 
          { 
              "hash":"foobarbaz", 
              "amount": 15.2, 
              "currency": "ZAR", 
              "description": "baz", 
              "timeStamp":"2020-09-01T15:00:00Z", 
              "balance": 0 
            }
        ]
    }`;

    const result = await parseFromString({
      fileType: "bank-schema",
      inputString: multiLineBankSchemaJsonString,
    });

    expect(result.parsingErrors).toBe(undefined);
  });
});
