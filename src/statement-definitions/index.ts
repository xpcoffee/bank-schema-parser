import bankSchema from "./bankSchema";
import fnbDefault from "./fnbDefault";
import fnbTransactionHistory from "./fnbTransactionHistory";
import standardbankDefault from "./standardbankDefault";
import standardbankHandmade from "./standardbankHandmade";

const statementDefinitions = {
  [bankSchema.fileType]: bankSchema.parse,
  [fnbDefault.fileType]: fnbDefault.parse,
  [fnbTransactionHistory.fileType]: fnbTransactionHistory.parse,
  [standardbankDefault.fileType]: standardbankDefault.parse,
  [standardbankHandmade.fileType]: standardbankHandmade.parse,
};

export const fileTypes = Object.keys(statementDefinitions);
export type FileType = keyof typeof statementDefinitions;

export default statementDefinitions;
