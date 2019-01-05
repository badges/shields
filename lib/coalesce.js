'use strict'

module.exports = function coalesce(...candidates) {
  return candidates.find(c => c !== undefined && c !== null)
}
