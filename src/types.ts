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
  balance: number;
}

export enum Banks {
  FNB = "fnb",
  StandardBank = "standardbank",
}

export enum InputFileTypes {
  Default = "DEFAULT",
  Handmade = "HANDMADE",
  TransactionHistory = "TRANSACTION_HISTORY",
}
