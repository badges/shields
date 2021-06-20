// Escapes `t` using the format specified in
// <https://github.com/espadrine/gh-badges/issues/12#issuecomment-31518129>
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
