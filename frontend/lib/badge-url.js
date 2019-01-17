import resolveUrl from './resolve-url'
import { staticBadgeUrl as makeStaticBadgeUrl } from '../../core/badge-urls/make-badge-url'

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
  const path = makeStaticBadgeUrl({ label, message, color })
  return resolveUrl(path, baseUrl, options)
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
    queryParams.colorB = color
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
