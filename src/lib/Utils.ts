export {
  isNumeric,
  areArraysEqual
};

/**
 * Checks if two arrays are equal to each other.
 * @param a first array
 * @param b second array
 * @param eq function that checks the equality of two array elements
 * @returns `true` if the two arrays are equal and `false` otherwise
 */
function areArraysEqual<T>(a: T[], b: T[], eq: (a: T, b: T) => boolean = (a: T, b: T) => a === b): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (!eq(a[i], b[i])) {
      return false;
    }
  }

  return true;
}


/* https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
   return true if the passed in value is a number or a string that is number */
function isNumeric(value: any): boolean {
  return !isNaN(value) && !isNaN(parseFloat(value));
}
