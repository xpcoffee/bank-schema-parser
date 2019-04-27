import { Statement, Transaction } from "./types";

type Dict<T> = { [key: string]: T };

/**
 * This deduplicates hashes of transactions in a Statement.
 *
 * Context: It's possible to have multiple transactions on the same day with the same data;
 * this happens most often with bank charges. So it is necessary to be able make those transaction
 * hashes distinct.
 *
 * Properties we want:
 *
 *  - idempotent for transactions: running this over two statements that have the same duplicate transactions
 *    should result in the same set of deduplicated transactions. This is important for safely working with
 *    different types of statement (monthly statements, yearly statements, etc).
 */
export default (untreatedStatement: Statement): Statement => {
  const statement = Object.assign({}, untreatedStatement);
  const dict: Dict<Transaction> = {};

  statement.transactions.forEach(transaction => {
    const hash = transaction.hash.toString();
    if (dict[hash]) {
      let newHash = `${hash}D`;
      while (dict[newHash]) {
        newHash = `${newHash}D`;
      }

      const newTransaction = Object.assign({}, transaction);
      newTransaction.hash = newHash;
      dict[newHash] = newTransaction;
    } else {
      dict[hash] = transaction;
    }
  });

  statement.transactions = Object.values(dict);
  return statement;
};
