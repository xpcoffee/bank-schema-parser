export interface Params {
  bank: string;
  statementFile: string;
}

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
