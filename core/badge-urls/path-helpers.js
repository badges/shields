/**
 * Escape a string according to the badge format encoding scheme. Underscores
 * and dashes in the input are decoded using the rules from
 * https://github.com/espadrine/gh-badges/issues/12#issuecomment-31518129
 *
 * Single underscores become spaces, double underscores become single
 * underscores, and double dashes become single dashes.
 *
 * @param {string} t - The format-encoded string to decode.
 * @returns {string} The decoded string.
 */
function escapeFormat(t) {
  return (
    t
      // Single underscore.
      .replace(/(^|[^_])((?:__)*)_(?!_)/g, '$1$2 ')
      // Double underscore and double dash.
      .replace(/__/g, '_')
      .replace(/--/g, '-')
  )
}

export { escapeFormat }
