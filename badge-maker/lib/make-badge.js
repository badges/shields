'use strict'

const { toSvgColor } = require('./color')
const badgeRenderers = require('./badge-renderers')
const { stripXmlWhitespace } = require('./xml')

/*
note: makeBadge() is fairly thinly wrapped so if we are making changes here
it is likely this will impact on the package's public interface in index.js
*/
module.exports = function makeBadge({
  style = 'flat',
  label,
  message,
  color,
  labelColor,
  logo,
  logoPosition,
  logoWidth,
  links = ['', ''],
}) {
  // String coercion and whitespace removal.
  label = `${label}`.trim()
  message = `${message}`.trim()

  const render = badgeRenderers[style]
  if (!render) {
    throw new Error(`Unknown badge style: '${style}'`)
  }

  logoWidth = +logoWidth || (logo ? 14 : 0)

  return stripXmlWhitespace(
    render({
      label,
      message,
      links,
      logo,
      logoPosition,
      logoWidth,
      logoPadding: logo && label.length ? 3 : 0,
      color: toSvgColor(color),
      labelColor: toSvgColor(labelColor),
    })
  )
}
