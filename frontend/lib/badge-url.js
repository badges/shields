import resolveUrl from './resolve-url'

export default function resolveBadgeUrl(
  url,
  baseUrl,
  { longCache, style, queryParams: inQueryParams, format = 'svg' } = {}
) {
  const outQueryParams = Object.assign({}, inQueryParams)
  if (longCache) {
    outQueryParams.maxAge = '2592000'
  }
  if (style) {
    outQueryParams.style = style
  }

  return resolveUrl(`${url}.${format}`, baseUrl, outQueryParams)
}

export function staticBadgeUrl(baseUrl, label, message, color, options) {
  const queryPrams = { label, message, color }
  for (const name in options) {
    queryPrams[name] = options[name]
  }

  return resolveUrl('/static/v1.svg', baseUrl, queryPrams)
}

// Options can include: { prefix, suffix, color, longCache, style, queryParams }
export function dynamicBadgeUrl(
  baseUrl,
  datatype,
  label,
  dataUrl,
  query,
  { prefix, suffix, color, queryParams = {}, ...rest } = {}
) {
  Object.assign(queryParams, {
    label,
    url: dataUrl,
    query,
  })

  if (color) {
    queryParams.color = color
  }
  if (prefix) {
    queryParams.prefix = prefix
  }
  if (suffix) {
    queryParams.suffix = suffix
  }

  const outOptions = Object.assign({ queryParams }, rest)

  return resolveBadgeUrl(`/badge/dynamic/${datatype}`, baseUrl, outOptions)
}
