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

export const FNB_STATEMENT_SECTIONS = {
  ACCOUNT_DETAILS: "2",
  STATEMENT_INFO: "3",
  SUMMARY: "4",
  TRANSACTIONS: "5",
  END: "6"
};

export const FNB_ACCOUNT_DETAILS_SECTIONS = {
  STATEMENT_SECTION_NUMBER: 0,
  ACCOUNT_NUMBER: 1,
  NAME: 2,
  TYPE: 3
};

export const FNB_TRANSACTION_SECTIONS = {
  STATEMENT_SECTION_NUMBER: 0,
  TRANSACTION_NUMBER: 1,
  DATE: 2,
  TYPE: 3,
  DESCRIPTION: 4,
  OBTUSE_DESCRIPTION: 5,
  AMOUNT: 6,
  BALANCE: 7,
  ACCRUED_CHARGES: 8
};
