import { Statement, Transaction } from "./types";

type Dict<T> = { [key: string]: T };

/**
 * This deduplicates hashes in the set.
 *
 * Context: It's possible to have multiple transactions on the same day with the same data.
 * This happens most often with bank charges.
 */
const deduplicate = (untreatedStatement: Statement): Statement => {
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

export default deduplicate;
