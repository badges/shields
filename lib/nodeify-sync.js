'use strict'

// Execute a synchronous block and invoke a standard error-first callback with
// the result.
function nodeifySync(resultFn, callback) {
  let result, error

  try {
    result = resultFn()
  } catch (e) {
    error = e
  }

  callback(error, result)
}

module.exports = nodeifySync
