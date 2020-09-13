import { Statement } from "./types";

export const UNKNOWN = "UNKNOWN";

export function getEmptyStatement(): Statement {
  return {
    account: UNKNOWN,
    bank: UNKNOWN,
    transactions: [],
    parsingErrors: [],
  };
}
