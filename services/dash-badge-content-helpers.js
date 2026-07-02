/**
 * Helpers for parsing badge content from a dash seperated single parameter.
 *
 * @module
 */

/**
 * Split string on dashses, but escape dash if double.
 * Escape slash if double.
 *
 * @param {string} s - String to split.
 * @returns {string[]} Parts of the string, split on unescaped dashes.
 */
function splitDashSeparatedOptionalParams(s) {
  const parts = []
  let cur = ''
  for (let i = 0; i < s.length; ) {
    const ch = s[i]
    const next = s[i + 1]
    if (ch === '-' && next === '-') {
      cur += '-'
      i += 2
    } else if (ch === '/' && next === '/') {
      cur += '/'
      i += 2
    } else if (ch === '-') {
      parts.push(cur)
      cur = ''
      i += 1
    } else {
      cur += ch
      i += 1
    }
  }
  parts.push(cur)
  return parts
}

export { splitDashSeparatedOptionalParams }
