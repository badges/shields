'use strict'

const fs = require('fs')
const path = require('path')
const SVGO = require('svgo')
const dot = require('dot')
const camelcase = require('camelcase')
const anafanafo = require('anafanafo')
const { normalizeColor, toSvgColor } = require('./color')
const templateFunctions = require('./templates')

// cache templates.
const templates = {}
const templateFiles = fs.readdirSync(path.join(__dirname, '..', 'templates'))
dot.templateSettings.strip = false // Do not strip whitespace.
templateFiles.forEach(async filename => {
  if (filename[0] === '.') {
    return
  }
  const templateData = fs
    .readFileSync(path.join(__dirname, '..', 'templates', filename))
    .toString()
  const extension = path.extname(filename).slice(1)
  const style = filename.slice(0, -`-template.${extension}`.length)
  // Compile the template. Necessary to always have a working template.
  templates[style] = dot.template(templateData)
  // Substitute dot code.
  const mapping = new Map()
  let mappingIndex = 1
  const untemplatedSvg = templateData.replace(/{{.*?}}/g, match => {
    // Weird substitution that currently works for all templates.
    const mapKey = `99999990${mappingIndex}.1`
    mappingIndex++
    mapping.set(mapKey, match)
    return mapKey
  })

  const svgo = new SVGO()
  const { data, error } = await svgo.optimize(untemplatedSvg)

  if (error !== undefined) {
    console.error(
      `Template ${filename}: ${error}\n` +
        '  Generated untemplated SVG:\n' +
        `---\n${untemplatedSvg}---\n`
    )
    return
  }

  // Substitute dot code back.
  let svg = data
  const unmappedKeys = []
  mapping.forEach((value, key) => {
    let keySubstituted = false
    svg = svg.replace(RegExp(key, 'g'), () => {
      keySubstituted = true
      return value
    })
    if (!keySubstituted) {
      unmappedKeys.push(key)
    }
  })
  if (unmappedKeys.length > 0) {
    console.error(
      `Template ${filename} has unmapped keys ` +
        `${unmappedKeys.join(', ')}.\n` +
        '  Generated untemplated SVG:\n' +
        `---\n${untemplatedSvg}\n---\n` +
        '  Generated template:\n' +
        `---\n${svg}\n---\n`
    )
    return
  }

  templates[style] = dot.template(svg)
})

module.exports = function makeBadge({
  format,
  template = 'flat',
  text,
  colorscheme,
  color,
  colorA,
  colorB,
  labelColor,
  logo,
  logoPosition,
  logoWidth,
  links = ['', ''],
}) {
  // String coercion and whitespace removal.
  text = text.map(value => `${value}`.trim())

  const [left, right] = text

  color = normalizeColor(color || colorB || colorscheme)
  labelColor = normalizeColor(labelColor || colorA)

  // This ought to be the responsibility of the server, not `makeBadge`.
  if (format === 'json') {
    return JSON.stringify({
      label: left,
      message: right,
      logoWidth,
      color,
      labelColor,
      link: links,
      name: left,
      value: right,
    })
  }

  template = camelcase(template)
  if (template.startsWith('popout') && logo) {
    template = template.replace('popout', 'flat')
  }

  let templateFn = templateFunctions[template]
  if (!templateFn) {
    template = 'flat'
    templateFn = templateFunctions.flat
  }

  if (template.startsWith('popout')) {
    logoPosition = logoPosition <= 10 && logoPosition >= -10 ? logoPosition : 0
    logoWidth = +logoWidth || 32
  }

  let leftWidth = (anafanafo(left) / 10) | 0
  // Increase chances of pixel grid alignment.
  if (leftWidth % 2 === 0) {
    leftWidth++
  }
  let rightWidth = (anafanafo(right) / 10) | 0
  // Increase chances of pixel grid alignment.
  if (rightWidth % 2 === 0) {
    rightWidth++
  }

  logoWidth = +logoWidth || (logo ? 14 : 0)

  let logoPadding
  if (left.length === 0) {
    logoPadding = 0
  } else {
    logoPadding = logo ? 3 : 0
  }

  leftWidth = leftWidth + 10 + logoWidth + logoPadding
  rightWidth = rightWidth + 10

  color = toSvgColor(color)
  labelColor = toSvgColor(labelColor)

  return templateFn({
    label: left,
    message: right,
    text: [left, right],
    widths: [leftWidth, rightWidth],
    leftWidth,
    rightWidth,
    links,
    logo,
    logoPosition,
    logoWidth,
    logoPadding,
    color,
    labelColor,
    colorB: color,
    colorA: labelColor,
  })
}
