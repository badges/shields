// Given a patternToRegex `pattern` with multiple-choice options like
// `foo|bar|baz`, return an array with the options. If it can't be described
// as multiple-choice options, return `undefined`.
const basicChars = /^[A-za-z0-9-]+$/
function patternToOptions(pattern) {
  const split = pattern.split('|')
  if (split.some(part => !part.match(basicChars))) {
    return undefined
  } else {
    return split
  }
}

module.exports = { patternToOptions }
