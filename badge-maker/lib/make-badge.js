import { normalizeColor, toSvgColor } from './color.js'
import badgeRenderers from './badge-renderers.js'
import { stripXmlWhitespace } from './xml.js'
import { DEFAULT_LOGO_HEIGHT } from './constants.js'

/*
note: makeBadge() is fairly thinly wrapped so if we are making changes here
it is likely this will impact on the package's public interface in index.js
*/
export default function makeBadge({
  format,
  style = 'flat',
  label,
  message,
  color,
  labelColor,
  logo,
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

  logoWidth = +logoWidth || (logo ? DEFAULT_LOGO_HEIGHT : 0)

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
