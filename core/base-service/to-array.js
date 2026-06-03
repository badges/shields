/**
 * Coerces a value to an array.
 *
 * - Returns an empty array when `val` is `undefined`.
 * - Returns `val` unchanged when it is already an array.
 * - Otherwise wraps `val` in a single-element array.
 *
 * @param {*} val - The value to coerce.
 * @returns {Array} The resulting array.
 */
export default function toArray(val) {
  if (val === undefined) {
    return []
  } else if (Object(val) instanceof Array) {
    return val
  } else {
    return [val]
  }
}
