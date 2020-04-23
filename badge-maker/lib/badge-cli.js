#!/usr/bin/env node

'use strict'

const { namedColors } = require('./color')
const { makeBadge } = require('./index')

if (process.argv.length < 4) {
  console.log('Usage: badge label message [:color] [@style]')
  console.log('Or:    badge label message color [labelColor] [@style]')
  console.log()
  console.log('  color, labelColor:')
  console.log(`    one of ${Object.keys(namedColors).join(', ')}.`)
  console.log('    #xxx (three hex digits)')
  console.log('    #xxxxxx (six hex digits)')
  console.log('    color (CSS color)')
  console.log()
  console.log('Eg: badge cactus grown :green @flat')
  console.log()
  process.exit()
}

// Find a format specifier.
let style = ''
for (let i = 4; i < process.argv.length; i++) {
  if (process.argv[i][0] === '@') {
    style = process.argv[i].slice(1)
    process.argv.splice(i, 1)
    continue
  }
}

const label = process.argv[2]
const message = process.argv[3]
let color = process.argv[4] || ':green'
const labelColor = process.argv[5]

const badgeData = { label, message }
if (style) {
  badgeData.style = style
}

if (color[0] === ':') {
  color = color.slice(1)
  if (namedColors[color] == null) {
    // Colorscheme not found.
    console.error('Invalid color scheme.')
    process.exit(1)
  }
  badgeData.color = color
} else {
  badgeData.color = color
  if (labelColor) {
    badgeData.labelColor = labelColor
  }
}

;(() => {
  try {
    console.log(makeBadge(badgeData))
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
