'use strict'

const { URL } = require('url')
const queryString = require('query-string')
const { compile } = require('path-to-regexp')

function badgeUrlFromPath({
  baseUrl = '',
  path,
  queryParams,
  style,
  format = '',
  longCache = false,
}) {
  const outExt = format.length ? `.${format}` : ''

  const outQueryString = queryString.stringify({
    cacheSeconds: longCache ? '2592000' : undefined,
    style,
    ...queryParams,
  })
  const suffix = outQueryString ? `?${outQueryString}` : ''

  return `${baseUrl}${path}${outExt}${suffix}`
}

function badgeUrlFromPattern({
  baseUrl = '',
  pattern,
  namedParams,
  queryParams,
  style,
  format = '',
  longCache = false,
}) {
  const toPath = compile(pattern, {
    strict: true,
    sensitive: true,
    encode: encodeURIComponent,
  })

  const path = toPath(namedParams)

  return badgeUrlFromPath({
    baseUrl,
    path,
    queryParams,
    style,
    format,
    longCache,
  })
}

function encodeField(s) {
  return encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'))
}

function staticBadgeUrl({
  baseUrl = '',
  label,
  message,
  color = 'lightgray',
  style,
  namedLogo,
  format = '',
}) {
  const path = [label, message, color].map(encodeField).join('-')
  const outQueryString = queryString.stringify({
    style,
    logo: namedLogo,
  })
  const outExt = format.length ? `.${format}` : ''
  const suffix = outQueryString ? `?${outQueryString}` : ''
  return `${baseUrl}/badge/${path}${outExt}${suffix}`
}

function queryStringStaticBadgeUrl({
  baseUrl = '',
  label,
  message,
  color,
  labelColor,
  style,
  namedLogo,
  logoColor,
  logoWidth,
  logoPosition,
  format = '',
}) {
  // schemaVersion could be a parameter if we iterate on it,
  // for now it's hardcoded to the only supported version.
  const schemaVersion = '1'
  const suffix = `?${queryString.stringify({
    label,
    message,
    color,
    labelColor,
    style,
    logo: namedLogo,
    logoColor,
    logoWidth,
    logoPosition,
  })}`
  const outExt = format.length ? `.${format}` : ''
  return `${baseUrl}/static/v${schemaVersion}${outExt}${suffix}`
}

function dynamicBadgeUrl({
  baseUrl,
  datatype,
  label,
  dataUrl,
  query,
  prefix,
  suffix,
  color,
  style,
  format = '',
}) {
  const outExt = format.length ? `.${format}` : ''

  const queryParams = {
    label,
    url: dataUrl,
    query,
    style,
  }

  if (color) {
    queryParams.color = color
  }
  if (prefix) {
    queryParams.prefix = prefix
  }
  if (suffix) {
    queryParams.suffix = suffix
  }

  const outQueryString = queryString.stringify(queryParams)
  return `${baseUrl}/badge/dynamic/${datatype}${outExt}?${outQueryString}`
}

function rasterRedirectUrl({ rasterUrl }, badgeUrl) {
  // Ensure we're always using the `rasterUrl` by using just the path from
  // the request URL.
  const { pathname, search } = new URL(badgeUrl, 'https://bogus.test')
  const result = new URL(pathname, rasterUrl)
  result.search = search
  return result
}

module.exports = {
  badgeUrlFromPath,
  badgeUrlFromPattern,
  encodeField,
  staticBadgeUrl,
  queryStringStaticBadgeUrl,
  dynamicBadgeUrl,
  rasterRedirectUrl,
}
