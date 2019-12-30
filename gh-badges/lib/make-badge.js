'use strict'

const camelcase = require('camelcase')
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

  const [label, message] = text

  color = normalizeColor(color || colorB || colorscheme)
  labelColor = normalizeColor(labelColor || colorA)

  // This ought to be the responsibility of the server, not `makeBadge`.
  if (format === 'json') {
    return JSON.stringify({
      label,
      message,
      logoWidth,
      color,
      labelColor,
      link: links,
      name: label,
      value: message,
    })
  }

  template = camelcase(template)
  if (template.startsWith('popout')) {
    template = template.replace('popout', 'flat')
  }

  let render = badgeRenderers[template]
  if (render === undefined) {
    template = 'flat'
    render = badgeRenderers.flat
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
