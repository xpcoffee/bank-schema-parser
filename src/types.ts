export interface Params {
  bank: string;
  statementFile: string;
}

export type StatementParser = (file: string) => Promise<Statement>;
export type ParsingFunction = (line: string, memo: Statement) => Statement;

export interface Statement {
  account: string;
  bank: string;
  transactions: Transaction[];
}

export interface Transaction {
  timeStamp: string;
  amountInZAR: number;
  description: string;
}