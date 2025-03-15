'use strict'

const { normalizeColor, toSvgColor } = require('./color')
const badgeRenderers = require('./badge-renderers')
const { stripXmlWhitespace } = require('./xml')
const { getIconSize } = require('./simple-icons-utils/svg-helpers')
const { prepareNamedLogo } = require('./simple-icons-utils/logos')
const { DEFAULT_LOGO_HEIGHT } = require('./constants')

/*
note: makeBadge() is fairly thinly wrapped so if we are making changes here
it is likely this will impact on the package's public interface in index.js
*/
module.exports = function makeBadge({
  format,
  style = 'flat',
  label,
  message,
  color,
  labelColor,
  logo,
  namedLogo,
  namedLogoColor,
  logoSize,
  logoWidth,
  links = ['', ''],
  idSuffix,
}) {
  // String coercion and whitespace removal.
  label = `${label}`.trim()
  message = `${message}`.trim()

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
      idSuffix,
    })
  }

  const render = badgeRenderers[style]
  if (!render) {
    throw new Error(`Unknown badge style: '${style}'`)
  }

  // we assume logo overrides namedLogo
  if (logoWidth) {
    logoWidth = +logoWidth
  } else if (logo) {
    logoWidth = DEFAULT_LOGO_HEIGHT
  } else if (namedLogo) {
    const iconSize = getIconSize(String(namedLogo).toLowerCase())
    if (iconSize && logoSize === 'auto') {
      logoWidth = (iconSize.width / iconSize.height) * DEFAULT_LOGO_HEIGHT
    } else {
      logoWidth = DEFAULT_LOGO_HEIGHT
    }
  } else {
    logoWidth = 0
  }

  if (namedLogo && !logo) {
    logo = prepareNamedLogo({
      name: namedLogo,
      color: namedLogoColor,
      size: logoSize,
      style,
    })
  }

  return stripXmlWhitespace(
    render({
      label,
      message,
      links,
      logo,
      logoWidth,
      logoSize,
      logoPadding: logo && label.length ? 3 : 0,
      color: toSvgColor(color),
      labelColor: toSvgColor(labelColor),
      idSuffix,
    }),
  )
}
