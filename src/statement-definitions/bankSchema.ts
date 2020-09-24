import { validateStatement } from "@xpcoffee/bank-schema";
import { Statement } from "../types";

function parse(line: string, memo: Statement): Statement {
  if (Object.isFrozen(memo)) {
    return {
      ...memo,
      parsingErrors: [
        "Raw bank-schema parse function called more than once. The bank-schema JSON string must be given in its entirety - so the parse function should only be called once.",
      ],
    };
  }

  const maybeStatement = JSON.parse(line);
  const validationResult = validateStatement(maybeStatement);

  if (!validationResult.valid) {
    return {
      account: "unknown",
      bank: "unkown",
      transactions: [],
      parsingErrors: ["The given input is not bank-schema compliant: " + validationResult.errors],
    };
  }

  Object.freeze(maybeStatement);
  return maybeStatement as Statement;
}

export default {
  fileType: "bank-schema" as const,
  parse,
};
