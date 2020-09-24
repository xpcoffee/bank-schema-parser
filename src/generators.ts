/**
 * Methods for working with generators
 */

/**
 * Reduce function for async generators.
 */
export async function reduceAsync<Element, ResultType>(
  iterable: AsyncGenerator<Element>,
  reductionFunction: (memo: ResultType, item: Element) => ResultType,
  initialValue: ResultType,
) {
  let memo = initialValue;
  for await (const element of iterable) {
    memo = reductionFunction(memo, element);
  }
  return memo;
}
