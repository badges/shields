const labelPattern = '(?:[^-]|--)*?'
const messagePattern = '(?:[^-]|--)*'
const colorPattern = '(?:[^-.]|--)+'

// This pattern deliberately contains no capturing groups so it can be
// embedded in a service route without changing the route's captures.
const staticBadgeContentPattern = `${labelPattern}-?${messagePattern}-${colorPattern}`
const staticBadgeRouteFormat = `(?::|badge/)${staticBadgeContentPattern}`

const staticBadgePathRegex = new RegExp(
  `^/(?::|badge/)(${labelPattern})-?(${messagePattern})-(${colorPattern})(?:\\.(svg|json))?$`,
)

/**
 * @typedef {object} StaticBadgePath
 * @property {string} label
 * @property {string} message
 * @property {string} color
 * @property {string} format
 * @property {object} [queryParams]
 */

/**
 * Decode text using the static badge path encoding.
 *
 * @param {string} text Encoded label or message.
 * @returns {string} Decoded badge text.
 */
function decodeBadgeText(text) {
  return text
    .replace(/(^|[^_])((?:__)*)_(?!_)/g, '$1$2 ')
    .replace(/__/g, '_')
    .replace(/--/g, '-')
}

/**
 * Encode text using the static badge path encoding.
 *
 * @param {string} text Badge label or message.
 * @returns {string} Encoded badge text.
 */
function encodeBadgeText(text) {
  return encodeURIComponent(text.replace(/_/g, '__').replace(/-/g, '--'))
}

function queryParamsFromSearchParams(searchParams) {
  const queryParams = {}
  for (const [name, value] of searchParams) {
    if (!Object.hasOwn(queryParams, name)) {
      queryParams[name] = value
    } else if (Array.isArray(queryParams[name])) {
      queryParams[name].push(value)
    } else {
      queryParams[name] = [queryParams[name], value]
    }
  }
  return queryParams
}

function searchParamsFromQueryParams(queryParams) {
  if (queryParams instanceof URLSearchParams) {
    return new URLSearchParams(queryParams)
  }
  if (queryParams === undefined) {
    return new URLSearchParams()
  }
  if (queryParams === null || typeof queryParams !== 'object') {
    throw new TypeError('queryParams must be an object or URLSearchParams')
  }

  const searchParams = new URLSearchParams()
  for (const [name, value] of Object.entries(queryParams)) {
    const values = Array.isArray(value) ? value : [value]
    for (const item of values) {
      if (item !== undefined && item !== null) {
        searchParams.append(name, `${item}`)
      }
    }
  }
  return searchParams
}

function lastQueryParam(queryParams, name) {
  const value = queryParams[name]
  return Array.isArray(value) ? value.at(-1) : value
}

/**
 * Parse an encoded static badge path, including an optional query string.
 *
 * The label and color query parameters are applied using the same precedence
 * as the badge pipeline. Other query parameters are returned without applying
 * rendering-specific behavior.
 *
 * @param {string} path Raw, percent-encoded URL path and optional query.
 * @param {object} [options] Parsing options.
 * @param {boolean} [options.isDecoded=false] Whether a router has already
 *   percent-decoded the pathname. Decoded input must not contain a query.
 * @returns {StaticBadgePath|undefined}
 *   Parsed badge path, or undefined when the pathname is not a static badge.
 */
function parseStaticBadgePath(path, { isDecoded = false } = {}) {
  let pathname = path
  let search = ''
  if (!isDecoded) {
    const fragmentIndex = pathname.indexOf('#')
    if (fragmentIndex !== -1) {
      pathname = pathname.slice(0, fragmentIndex)
    }
    const queryIndex = pathname.indexOf('?')
    if (queryIndex !== -1) {
      search = pathname.slice(queryIndex + 1)
      pathname = pathname.slice(0, queryIndex)
    }
  }

  let decodedPathname = pathname
  if (!isDecoded) {
    try {
      decodedPathname = decodeURIComponent(pathname)
    } catch {
      return undefined
    }
  }

  const match = staticBadgePathRegex.exec(decodedPathname)
  if (!match) {
    return undefined
  }

  const [, label, message, color, format = 'svg'] = match
  const queryParams = queryParamsFromSearchParams(new URLSearchParams(search))
  const overrideLabel = lastQueryParam(queryParams, 'label')
  const overrideColor = Object.hasOwn(queryParams, 'color')
    ? lastQueryParam(queryParams, 'color')
    : lastQueryParam(queryParams, 'colorB')

  const result = {
    label: overrideLabel ?? decodeBadgeText(label),
    message: decodeBadgeText(message),
    color: overrideColor ?? color,
    format,
  }
  if (Object.keys(queryParams).length > 0) {
    result.queryParams = queryParams
  }
  return result
}

/**
 * Build a canonical static badge pathname.
 *
 * @param {object} badge Static badge path data.
 * @param {string} [badge.label=''] Badge label.
 * @param {string} badge.message Badge message.
 * @param {string} badge.color Badge color as a name, hex value, or CSS color.
 * @param {'svg'|'json'} [badge.format='svg'] Output format.
 * @param {object|URLSearchParams} [badge.queryParams] Query parameters. Array
 *   values are serialized as repeated parameters.
 * @returns {string} Percent-encoded static badge path.
 */
function formatStaticBadgePath({
  label = '',
  message,
  color,
  format = 'svg',
  queryParams,
}) {
  const searchParams = searchParamsFromQueryParams(queryParams)
  const hasLabelOverride = searchParams.has('label')
  const hasColorOverride =
    searchParams.has('color') || searchParams.has('colorB')

  if (typeof label !== 'string') {
    throw new TypeError('label must be a string')
  }
  if (label.endsWith('-') && !hasLabelOverride) {
    throw new TypeError('label cannot end with a dash in the static badge path')
  }
  if (typeof message !== 'string') {
    throw new TypeError('message must be a string')
  }
  if (typeof color !== 'string' || color.length === 0) {
    throw new TypeError('color must be a non-empty string')
  }
  if (/[.-]/.test(color) && !hasColorOverride) {
    throw new TypeError('color cannot contain dots or dashes')
  }
  if (format !== 'svg' && format !== 'json') {
    throw new TypeError("format must be either 'svg' or 'json'")
  }

  const pathLabel = label.endsWith('-') ? '' : label
  const pathColor = /[.-]/.test(color) ? 'lightgrey' : color
  const encodedLabel = encodeBadgeText(pathLabel)
  const encodedMessage = encodeBadgeText(message)
  const encodedColor = encodeURIComponent(pathColor)
  const content = encodedLabel
    ? `${encodedLabel}-${encodedMessage}`
    : encodedMessage
  const search = searchParams.toString()

  return `/badge/${content}-${encodedColor}.${format}${search ? `?${search}` : ''}`
}

export {
  decodeBadgeText,
  formatStaticBadgePath,
  parseStaticBadgePath,
  staticBadgeRouteFormat,
}
