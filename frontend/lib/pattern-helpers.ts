import { parse } from 'path-to-regexp'

// Given a patternToRegex `pattern` with multiple-choice options like
// `foo|bar|baz`, return an array with the options. If it can't be described
// as multiple-choice options, return `undefined`.
const basicChars = /^[A-za-z0-9-]+$/
export function patternToOptions(pattern: string): string[] | undefined {
  const split = pattern.split('|')
  if (split.some(part => !part.match(basicChars))) {
    return undefined
  } else {
    return split
  }
}

// Removes regexp for named parameters.
export function removeRegexpFromPattern(pattern: string): string {
  const tokens = parse(pattern)
  const simplePattern = tokens
    .map(token => {
      if (typeof token === 'string') {
        return token
      } else {
        const { prefix, modifier, name, pattern } = token
        if (typeof name === 'number') {
          return `${prefix}(${pattern})`
        } else {
          return `${prefix}:${name}${modifier}`
        }
      }
    })
    .join('')
  return simplePattern
}
