/**
 * Generate a random 9-character alphanumeric instance identifier.
 *
 * @returns {string} Random identifier (e.g. `a1b2c3d4e`).
 */
function generateInstanceId() {
  // from https://gist.github.com/gordonbrander/2230317
  return Math.random().toString(36).substr(2, 9)
}

export default generateInstanceId
