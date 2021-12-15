'use strict'

function findChangelogStart(lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (
      line === '<summary>Changelog</summary>' &&
      lines[i + 2] === '<blockquote>'
    ) {
      return i + 3
    }
  }
  return null
}

function findChangelogEnd(lines, start) {
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]
    if (line === '</blockquote>') {
      return i
    }
  }
  return null
}

function allChangelogLinesAreVersionBump(changelogLines) {
  return (
    changelogLines.length > 0 &&
    changelogLines.length ===
      changelogLines.filter(line =>
        line.includes('Version bump only for package')
      ).length
  )
}

function isPointlessVersionBump(body) {
  const pointlessBumpLinks = [
    'https://github.com/gatsbyjs/gatsby',
    'https://github.com/typescript-eslint/typescript-eslint',
  ]

  const lines = body.split(/\r?\n/)
  if (!pointlessBumpLinks.some(link => lines[0].includes(link))) {
    return false
  }
  const start = findChangelogStart(lines)
  const end = findChangelogEnd(lines, start)
  if (!start || !end) {
    return false
  }
  const changelogLines = lines
    .slice(start, end)
    .filter(line => !line.startsWith('<h'))
    .filter(line => !line.startsWith('<p>All notable changes'))
    .filter(
      line => !line.startsWith('See <a href="https://conventionalcommits.org">')
    )
    .filter(line => !line.startsWith('<!--'))
    .filter(
      line =>
        !line.startsWith(
          '<p><a href="https://www.gatsbyjs.com/docs/reference/release-notes/'
        )
    )
  return allChangelogLinesAreVersionBump(changelogLines)
}

module.exports = { isPointlessVersionBump }
