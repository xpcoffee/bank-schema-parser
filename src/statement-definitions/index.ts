import { ParsingFunction } from "../parser";
import fnbDefault from "./fnbDefault";
import fnbTransactionHistory from "./fnbTransactionHistory";
import standardbankDefault from "./standardbankDefault";
import standardBankDefault from "./standardbankDefault";
import standardbankHandmade from "./standardbankHandmade";
import standardBankHandmade from "./standardbankHandmade";

const statementDefinitions = {
  [fnbDefault.fileType]: fnbDefault.parse,
  [fnbTransactionHistory.fileType]: fnbTransactionHistory.parse,
  [standardBankDefault.fileType]: standardbankDefault.parse,
  [standardbankHandmade.fileType]: standardBankHandmade.parse,
} as const;

export const fileTypes = Object.keys(statementDefinitions);
export type FileType = keyof typeof statementDefinitions;

export default statementDefinitions;
