'use strict'

const fs = require('fs')
const path = require('path')
const SVGO = require('svgo')
const dot = require('dot')
const anafanafo = require('anafanafo')
const { normalizeColor, toSvgColor } = require('./color')

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
  templates[`${style}-${extension}`] = dot.template(templateData)
  if (extension === 'svg') {
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

    templates[`${style}-${extension}`] = dot.template(svg)
  }
})

function escapeXml(s) {
  if (s === undefined || typeof s !== 'string') {
    return undefined
  } else {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function makeBadge({
  format,
  template,
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

  if (format !== 'json') {
    format = 'svg'
  }

  if (!(`${template}-${format}` in templates)) {
    template = format === 'svg' ? 'flat' : 'default'
  }
  if (template.startsWith('popout')) {
    if (logo) {
      logoPosition =
        logoPosition <= 10 && logoPosition >= -10 ? logoPosition : 0
      logoWidth = +logoWidth || 32
    } else {
      template = template.replace('popout', 'flat')
    }
  }
  if (template === 'social') {
    text[0] = capitalize(text[0])
  } else if (template === 'for-the-badge') {
    text = text.map(value => value.toUpperCase())
  }

  const [left, right] = text
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

  color = color || colorB || colorscheme
  labelColor = labelColor || colorA

  const context = {
    text: [left, right],
    escapedText: text.map(escapeXml),
    widths: [leftWidth + 10 + logoWidth + logoPadding, rightWidth + 10],
    links: links.map(escapeXml),
    logo,
    logoPosition,
    logoWidth,
    logoPadding,
    // `color` and `labelColor` are included for the `_shields_test` template.
    color: normalizeColor(color),
    labelColor: normalizeColor(labelColor),
    colorA: toSvgColor(labelColor),
    colorB: toSvgColor(color),
    escapeXml,
  }

  const templateFn = templates[`${template}-${format}`]

  // The call to template() can raise an exception.
  return templateFn(context)
}

module.exports = makeBadge
