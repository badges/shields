'use strict'

const {
  decodeDataUrlFromQueryParam,
  prepareNamedLogo,
} = require('../../lib/logos')
const { toArray } = require('../../lib/badge-data')
const { svg2base64 } = require('../../lib/svg-helpers')
const coalesce = require('./coalesce')

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
module.exports = function coalesceBadge(
  overrides,
  serviceData,
  // These two parameters were kept separate to make tests clearer.
  defaultBadgeData,
  { category, _cacheLength: defaultCacheSeconds } = {}
) {
  const {
    style: overrideStyle,
    label: overrideLabel,
    logoColor: overrideLogoColor,
    link: overrideLink,
  } = overrides
  // Scoutcamp converts numeric query params to numbers. Convert them back.
  let {
    colorB: overrideColor,
    colorA: overrideLabelColor,
    logoWidth: overrideLogoWidth,
    logoPosition: overrideLogoPosition,
  } = overrides
  if (typeof overrideColor === 'number') {
    overrideColor = `${overrideColor}`
  }
  if (typeof overrideLabelColor === 'number') {
    overrideLabelColor = `${overrideLabelColor}`
  }
  overrideLogoWidth = +overrideLogoWidth || undefined
  overrideLogoPosition = +overrideLogoPosition || undefined
  // `?logo=` could be a named logo or encoded svg. Split up these cases.
  const overrideLogoSvgBase64 = decodeDataUrlFromQueryParam(overrides.logo)
  const overrideNamedLogo = overrideLogoSvgBase64 ? undefined : overrides.logo

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
  const serviceLogoSvgBase64 = serviceLogoSvg
    ? svg2base64(serviceLogoSvg)
    : undefined

  const {
    color: defaultColor,
    namedLogo: defaultNamedLogo,
    label: defaultLabel,
    labelColor: defaultLabelColor,
  } = defaultBadgeData

  const style = coalesce(overrideStyle, serviceStyle)

  const namedLogo = coalesce(
    overrideNamedLogo,
    serviceNamedLogo,
    style === 'social' ? defaultNamedLogo : undefined
  )
  const namedLogoSvgBase64 = prepareNamedLogo({
    name: namedLogo,
    color: coalesce(
      overrideLogoColor,
      // If the logo has been overridden it does not make sense to inherit
      // the color.
      overrideNamedLogo ? undefined : serviceLogoColor
    ),
    style,
  })

  return {
    text: [
      // Use `coalesce()` to support empty labels and messages, as in the
      // static badge.
      coalesce(overrideLabel, serviceLabel, defaultLabel, category),
      coalesce(serviceMessage, 'n/a'),
    ],
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
    template: style,
    namedLogo,
    logo: coalesce(
      overrideLogoSvgBase64,
      serviceLogoSvgBase64,
      namedLogoSvgBase64
    ),
    logoWidth: coalesce(
      overrideLogoWidth,
      // If the logo has been overridden it does not make sense to inherit
      // the width or position.
      overrideNamedLogo ? undefined : serviceLogoWidth
    ),
    logoPosition: coalesce(
      overrideLogoPosition,
      overrideNamedLogo ? undefined : serviceLogoPosition
    ),
    links: toArray(overrideLink || serviceLink),
    cacheLengthSeconds: coalesce(serviceCacheSeconds, defaultCacheSeconds),
  }
}
