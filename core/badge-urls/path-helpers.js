'use strict'

// Escapes `t` using the format specified in
// <https://github.com/espadrine/gh-badges/issues/12#issuecomment-31518129>
function escapeFormat(t) {
  return (
    t
      // Inline single underscore.
      .replace(/([^_])_([^_])/g, '$1 $2')
      // Leading or trailing underscore.
      .replace(/([^_])_$/, '$1 ')
      .replace(/^_([^_])/, ' $1')
      // Double underscore and double dash.
      .replace(/__/g, '_')
      .replace(/--/g, '-')
  )
}

module.exports = {
  escapeFormat,
}
