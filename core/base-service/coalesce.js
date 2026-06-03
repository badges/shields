/**
 * Returns the first non-null, non-undefined value from the provided candidates.
 *
 * Mirrors SQL's {@code COALESCE}: iterates the arguments in order and returns
 * the first one that is neither {@code undefined} nor {@code null}.
 * Returns {@code undefined} when all candidates are null or undefined.
 *
 * @param {...*} candidates - Values to evaluate in order.
 * @returns {*} The first defined, non-null candidate, or `undefined`.
 */
export default function coalesce(...candidates) {
  return candidates.find(c => c !== undefined && c !== null)
}