import { validateStatement } from "@xpcoffee/bank-schema";
import { ParsingFunction, Statement } from "../types";

const parse: ParsingFunction = (memo: Statement, line: string): Statement => {
  if (Object.isFrozen(memo)) {
    return {
      ...memo,
      parsingErrors: [
        "Raw bank-schema parse function called more than once. The bank-schema JSON string must be given in its entirety - so the parse function should only be called once.",
      ],
    };
  }

  let maybeStatement;
  try {
    maybeStatement = JSON.parse(line);
  } catch (e) {
    return {
      account: "unknown",
      bank: "unkown",
      transactions: [],
      parsingErrors: [...memo.parsingErrors, "Unable to parse bank-schema JSON: " + e],
    };
  }

  const validationResult = validateStatement(maybeStatement);

  if (!validationResult.valid) {
    return {
      account: "unknown",
      bank: "unkown",
      transactions: [],
      parsingErrors: [
        ...memo.parsingErrors,
        "The given input is not bank-schema compliant: " + validationResult.errors,
      ],
    };
  }

  Object.freeze(maybeStatement);
  return maybeStatement as Statement;
};

export default {
  fileType: "bank-schema" as const,
  parse,
};
