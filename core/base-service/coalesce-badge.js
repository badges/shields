import {
  decodeDataUrlFromQueryParam,
  prepareNamedLogo,
} from '../../lib/logos.js'
import { svg2base64 } from '../../lib/svg-helpers.js'
import coalesce from './coalesce.js'
import toArray from './to-array.js'

// Translate modern badge data to the legacy schema understood by the badge
// maker. Allow the user to override the label, color, logo, etc. through the
// query string. Provide support for most badge options via `serviceData` so
// the Endpoint badge can specify logos and colors, though allow that the
// user's logo or color to take precedence. A notable exception is the case of
// errors. When the service specifies that an error has occurred, the user's
// requested color does not override the error color.
//
// Logos are resolved in this manner:
//
// 1. When `?logo=` contains the name of one of the Shields logos, or contains
//    base64-encoded SVG, that logo is used. In the case of a named logo, when
//    a `&logoColor=` is specified, that color is used. Otherwise the default
//    color is used. `logoColor` will not be applied to a custom
//    (base64-encoded) logo; if a custom color is desired the logo should be
//    recolored prior to making the request. The appearance of the logo can be
//    customized using `logoWidth`, and in the case of the popout badge,
//    `logoPosition`. When `?logo=` is specified, any logo-related parameters
//    specified dynamically by the service, or by default in the service, are
//    ignored.
// 2. The second precedence is the dynamic logo returned by a service. This is
//    used only by the Endpoint badge. The `logoColor` can be overridden by the
//    query string.
// 3. In the case of the `social` style only, the last precedence is the
//    service's default logo. The `logoColor` can be overridden by the query
//    string.
export default function coalesceBadge(
  overrides,
  serviceData,
  // These two parameters were kept separate to make tests clearer.
  defaultBadgeData,
  { category, _cacheLength: defaultCacheSeconds } = {}
) {
  // The "overrideX" naming is based on services that provide badge
  // parameters themselves, which can be overridden by a query string
  // parameter. (For a couple services, the dynamic badge and the
  // query-string-based static badge, the service never sets a value
  // so the query string overrides are the _only_ way to configure
  // these badge parameters.
  const {
    style: overrideStyle,
    label: overrideLabel,
    logo: overrideLogo,
    logoColor: overrideLogoColor,
    link: overrideLink,
    colorB: legacyOverrideColor,
    colorA: legacyOverrideLabelColor,
  } = overrides
  let {
    logoWidth: overrideLogoWidth,
    logoPosition: overrideLogoPosition,
    color: overrideColor,
    labelColor: overrideLabelColor,
  } = overrides

  // Only use the legacy properties if the new ones are not provided
  if (typeof overrideColor === 'undefined') {
    overrideColor = legacyOverrideColor
  }
  if (typeof overrideLabelColor === 'undefined') {
    overrideLabelColor = legacyOverrideLabelColor
  }

  // Scoutcamp converts numeric query params to numbers. Convert them back.
  if (typeof overrideColor === 'number') {
    overrideColor = `${overrideColor}`
  }
  if (typeof overrideLabelColor === 'number') {
    overrideLabelColor = `${overrideLabelColor}`
  }
  overrideLogoWidth = +overrideLogoWidth || undefined
  overrideLogoPosition = +overrideLogoPosition || undefined

  const {
    isError,
    label: serviceLabel,
    message: serviceMessage,
    color: serviceColor,
    labelColor: serviceLabelColor,
    logoSvg: serviceLogoSvg,
    namedLogo: serviceNamedLogo,
    logoColor: serviceLogoColor,
    logoWidth: serviceLogoWidth,
    logoPosition: serviceLogoPosition,
    link: serviceLink,
    cacheSeconds: serviceCacheSeconds,
    style: serviceStyle,
  } = serviceData

  const {
    color: defaultColor,
    namedLogo: defaultNamedLogo,
    label: defaultLabel,
    labelColor: defaultLabelColor,
  } = defaultBadgeData

  let style = coalesce(overrideStyle, serviceStyle)
  if (typeof style !== 'string') {
    style = 'flat'
  }
  if (style.startsWith('popout')) {
    style = style.replace('popout', 'flat')
  }
  const styleValues = [
    'plastic',
    'flat',
    'flat-square',
    'for-the-badge',
    'social',
  ]
  if (!styleValues.includes(style)) {
    style = 'flat'
  }

  let namedLogo, namedLogoColor, logoWidth, logoPosition, logoSvgBase64
  if (overrideLogo) {
    // `?logo=` could be a named logo or encoded svg.
    const overrideLogoSvgBase64 = decodeDataUrlFromQueryParam(overrideLogo)
    if (overrideLogoSvgBase64) {
      logoSvgBase64 = overrideLogoSvgBase64
    } else {
      namedLogo = overrideLogo
      // If the logo has been overridden it does not make sense to inherit the
      // original color.
      namedLogoColor = overrideLogoColor
    }
    // If the logo has been overridden it does not make sense to inherit the
    // original width or position.
    logoWidth = overrideLogoWidth
    logoPosition = overrideLogoPosition
  } else {
    if (serviceLogoSvg) {
      logoSvgBase64 = svg2base64(serviceLogoSvg)
    } else {
      namedLogo = coalesce(
        serviceNamedLogo,
        style === 'social' ? defaultNamedLogo : undefined
      )
      namedLogoColor = coalesce(overrideLogoColor, serviceLogoColor)
    }
    logoWidth = coalesce(overrideLogoWidth, serviceLogoWidth)
    logoPosition = coalesce(overrideLogoPosition, serviceLogoPosition)
  }
  if (namedLogo) {
    logoSvgBase64 = prepareNamedLogo({
      name: namedLogo,
      color: namedLogoColor,
      style,
    })
  }

  return {
    // Use `coalesce()` to support empty labels and messages, as in the static
    // badge.
    label: coalesce(overrideLabel, serviceLabel, defaultLabel, category),
    message: coalesce(serviceMessage, 'n/a'),
    color: coalesce(
      // In case of an error, disregard user's color override.
      isError ? undefined : overrideColor,
      serviceColor,
      defaultColor,
      'lightgrey'
    ),
    labelColor: coalesce(
      // In case of an error, disregard user's color override.
      isError ? undefined : overrideLabelColor,
      serviceLabelColor,
      defaultLabelColor
    ),
    style,
    namedLogo,
    logo: logoSvgBase64,
    logoWidth,
    logoPosition,
    links: toArray(overrideLink || serviceLink),
    cacheLengthSeconds: coalesce(serviceCacheSeconds, defaultCacheSeconds),
  }
}
