export interface Params {
  bank: string;
  file: string;
}

export type StatementParser = (file: string) => Promise<Statement>;
export type ParsingFunction = (line: string, memo: Statement) => Statement;

export interface Statement {
  account: string;
  bank: string;
  transactions: Transaction[];
  parsingErrors: string[];
}

export interface Transaction {
  timeStamp: string;
  amountInZAR: number;
  description: string;
  hash: string;
}
