'use strict'

const queryString = require('query-string')

function encodeField(s) {
  return encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'))
}

function staticBadgeUrl({
  baseUrl,
  label,
  message,
  color = 'lightgray',
  style,
  format = 'svg',
}) {
  if (!label || !message) {
    throw Error('label and message are required')
  }
  const path = [label, message, color].map(encodeField).join('-')
  const outQueryString = queryString.stringify({
    style,
  })
  const suffix = outQueryString ? `?${outQueryString}` : ''
  return `/badge/${path}.${format}${suffix}`
}

module.exports = {
  encodeField,
  staticBadgeUrl,
}
