export interface Statement {
  account: string;
  bank: string;
  transactions: Transaction[];
  parsingErrors: string[];
}

export interface Transaction {
  timeStamp: string;
  amount: number;
  currency: string;
  description: string;
  hash: string;
  balance: number;
}

export enum Banks {
  FNB = "fnb",
  StandardBank = "standardbank",
}

export enum Currencies {
  SouthAfricaRand = "ZAR",
}

export type StatementParser = (file: string) => Promise<Statement>;
export type ParsingFunction = (memo: Statement, line: string) => Statement;
