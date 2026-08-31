import {
  decodeDataUrlFromQueryParam,
  prepareNamedLogo,
} from '../../lib/logos.js'
import { svg2base64, getIconSize } from '../../lib/svg-helpers.js'
import { DEFAULT_LOGO_HEIGHT } from '../../badge-maker/lib/constants.js'
import coalesce from './coalesce.js'
import toArray from './to-array.js'

/**
 * Translate modern badge data to the legacy schema understood by the badge
 * maker. Allows the user to override label, color, logo, etc. through the
 * query string. Provides support for most badge options via `serviceData` so
 * the Endpoint badge can specify logos and colors, though the user's logo or
 * color takes precedence. A notable exception: when the service specifies an
 * error, the user's color override is disregarded.
 *
 * Logos are resolved in this precedence order:
 *
 * 1. `?logo=` query param (named simple-icons logo or base64-encoded SVG).
 * 2. Dynamic logo returned by the service (Endpoint badge only).
 * 3. Service's default logo (social style only).
 *
 * @param {object} overrides - Query-string override values (style, label,
 *    logo, color, etc.).
 * @param {object} serviceData - Badge data from the service (message, color,
 *    logo, cache seconds, etc.).
 * @param {object} defaultBadgeData - Default badge values (color, label,
 *    named logo).
 * @param {object} [context] - Optional context including category and cache
 *    length.
 * @param {string} [context.category] - Badge category for the default label.
 * @param {number} [context._cacheLength] - Default cache duration in seconds.
 * @returns {object} Normalized badge data object ready for rendering.
 */
export default function coalesceBadge(
  overrides,
  serviceData,
  // These two parameters were kept separate to make tests clearer.
  defaultBadgeData,
  { category, _cacheLength: defaultCacheSeconds } = {},
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
    logoSize: overrideLogoSize,
    link: overrideLink,
    colorB: legacyOverrideColor,
    colorA: legacyOverrideLabelColor,
  } = overrides
  let { color: overrideColor, labelColor: overrideLabelColor } = overrides

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

  const {
    isError,
    label: serviceLabel,
    message: serviceMessage,
    color: serviceColor,
    labelColor: serviceLabelColor,
    logoSvg: serviceLogoSvg,
    namedLogo: serviceNamedLogo,
    logoColor: serviceLogoColor,
    logoSize: serviceLogoSize,
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

  let namedLogo, namedLogoColor, logoSize, logoWidth, logoSvgBase64
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
    logoSize = overrideLogoSize
  } else {
    if (serviceLogoSvg) {
      logoSvgBase64 = svg2base64(serviceLogoSvg)
    } else {
      namedLogo = coalesce(
        serviceNamedLogo,
        style === 'social' ? defaultNamedLogo : undefined,
      )
      namedLogoColor = coalesce(overrideLogoColor, serviceLogoColor)
    }
    logoSize = coalesce(overrideLogoSize, serviceLogoSize)
  }
  if (namedLogo) {
    const iconSize = getIconSize(String(namedLogo).toLowerCase())

    if (iconSize && logoSize === 'auto') {
      logoWidth = (iconSize.width / iconSize.height) * DEFAULT_LOGO_HEIGHT
    }

    logoSvgBase64 = prepareNamedLogo({
      name: namedLogo,
      color: namedLogoColor,
      size: logoSize,
      style,
    })
  }

  const badgeData = {
    // Use `coalesce()` to support empty labels and messages, as in the static
    // badge.
    label: coalesce(overrideLabel, serviceLabel, defaultLabel, category),
    message: coalesce(serviceMessage, 'n/a'),
    color: coalesce(
      // In case of an error, disregard user's color override.
      isError ? undefined : overrideColor,
      serviceColor,
      defaultColor,
      'lightgrey',
    ),
    labelColor: coalesce(
      // In case of an error, disregard user's color override.
      isError ? undefined : overrideLabelColor,
      serviceLabelColor,
      defaultLabelColor,
    ),
    style,
    namedLogo,
    logo: logoSvgBase64,
    logoWidth,
    logoSize,
    links: toArray(overrideLink || serviceLink),
    cacheLengthSeconds: coalesce(serviceCacheSeconds, defaultCacheSeconds),
  }
  badgeData.label =
    typeof badgeData.label === 'string'
      ? badgeData.label.slice(0, 255)
      : badgeData.label
  badgeData.message =
    typeof badgeData.message === 'string'
      ? badgeData.message.slice(0, 255)
      : badgeData.message
  return badgeData
}
