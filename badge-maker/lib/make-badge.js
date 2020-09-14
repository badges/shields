'use strict'

const { normalizeColor, toSvgColor } = require('./color')
const badgeRenderers = require('./badge-renderers')

/*
note: makeBadge() is fairly thinly wrapped so if we are making changes here
it is likely this will impact on the package's public interface in index.js
*/
module.exports = function makeBadge({
  format,
  template = 'flat',
  text,
  color,
  labelColor,
  logo,
  logoPosition,
  logoWidth,
  links = ['', ''],
}) {
  // String coercion and whitespace removal.
  text = text.map(value => `${value}`.trim())

  const [label, message] = text

  // This ought to be the responsibility of the server, not `makeBadge`.
  if (format === 'json') {
    return JSON.stringify({
      label,
      message,
      logoWidth,
      // Only call normalizeColor for the JSON case: this is handled
      // internally by toSvgColor in the SVG case.
      color: normalizeColor(color),
      labelColor: normalizeColor(labelColor),
      link: links,
      name: label,
      value: message,
    })
  }

  const render = badgeRenderers[template]
  if (!render) {
    throw new Error(`Unknown template: '${template}'`)
  }

  logoWidth = +logoWidth || (logo ? 14 : 0)

  return render({
    label,
    message,
    links,
    logo,
    logoPosition,
    logoWidth,
    logoPadding: logo && label.length ? 3 : 0,
    color: toSvgColor(color),
    labelColor: toSvgColor(labelColor),
    minify: true,
  })
}
