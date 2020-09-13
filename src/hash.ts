/**
 * Computes a hash value for a string
 */
export default (str: string): string => {
  let hash = 0;
  let chr;

  if (str.length === 0) {
    return hash.toString();
  }

  for (let i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash.toString();
};
