#!/usr/bin/env node

'use strict'

const makeBadge = require('./make-badge')
const svg2img = require('./svg-to-img')
const { namedColors } = require('./color')

if (process.argv.length < 4) {
  console.log('Usage: badge subject status [:color] [.output] [@style]')
  console.log(
    'Or:    badge subject status color [labelColor] [.output] [@style]'
  )
  console.log()
  console.log('  color, labelColor:')
  console.log(`    one of ${Object.keys(namedColors).join(', ')}.`)
  console.log('    #xxx (three hex digits)')
  console.log('    #xxxxxx (six hex digits)')
  console.log('    color (CSS color)')
  console.log('  output:')
  console.log('    svg, png, jpg, or gif')
  console.log()
  console.log('Eg: badge cactus grown :green @flat')
  console.log()
  process.exit()
}

// Find a format specifier.
let format = 'svg'
let style = ''
for (let i = 4; i < process.argv.length; i++) {
  if (process.argv[i][0] === '.') {
    format = process.argv[i].slice(1)
    process.argv.splice(i, 1)
    continue
  }
  if (process.argv[i][0] === '@') {
    style = process.argv[i].slice(1)
    process.argv.splice(i, 1)
    continue
  }
}

const subject = process.argv[2]
const status = process.argv[3]
let color = process.argv[4] || ':green'
const colorA = process.argv[5]

const badgeData = { text: [subject, status], format }
if (style) {
  badgeData.template = style
}

if (color[0] === ':') {
  color = color.slice(1)
  if (namedColors[color] == null) {
    // Colorscheme not found.
    console.error('Invalid color scheme.')
    process.exit(1)
  }
  badgeData.colorscheme = color
} else {
  badgeData.colorB = color
  if (colorA) {
    badgeData.colorA = colorA
  }
}

async function main() {
  const svg = makeBadge(badgeData)

  if (/png|jpg|gif/.test(format)) {
    const data = await svg2img(svg, format)
    process.stdout.write(data)
  } else {
    console.log(svg)
  }
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
