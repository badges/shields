'use strict'

const makeBadge = require('../../badge-maker/lib/make-badge')
const { _clean } = require('../../badge-maker')

function pick(obj, keys) {
  const result = {}
  keys.forEach(k => {
    result[k] = obj[k]
  })
  return result
}

function makeBadgeOrJson(badgeData, format = 'svg') {
  if (format === 'json') {
    const { label, message, color, labelColor } = _clean(
      pick(badgeData, ['label', 'message', 'labelColor', 'color'])
    )
    const { links, logoWidth } = badgeData
    return JSON.stringify({
      label,
      message,
      color,
      labelColor,
      link: links,
      logoWidth,
      name: label,
      value: message,
    })
  } else {
    return makeBadge({ style: 'flat', ...badgeData })
  }
}

module.exports = { makeBadgeOrJson }
