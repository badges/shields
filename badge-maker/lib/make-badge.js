'use strict'

const camelcase = require('camelcase')
const { toSvgColor } = require('./color')
const badgeRenderers = require('./badge-renderers')

/*
note: makeBadge() is fairly thinly wrapped so if we are making changes here
it is likely this will impact on the package's public interface in index.js
*/
module.exports = function makeBadge({
  style,
  label,
  message,
  color,
  labelColor,
  logo,
  logoPosition,
  logoWidth,
  links,
}) {
  const methodName = camelcase(style)
  if (!(methodName in badgeRenderers)) {
    throw new Error(`Unknown style: '${style}'`)
  }
  const render = badgeRenderers[methodName]

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
