'use strict'

const { metric, addv } = require('../text-formatters')
const { downloadCount: downloadCountColor } = require('../color-formatters')

function renderVersionBadge({ version, feed }) {
  let color
  if (version.includes('-')) {
    color = 'yellow'
  } else if (version.startsWith('0')) {
    color = 'orange'
  } else {
    color = 'blue'
  }

  return {
    message: addv(version),
    color,
    label: feed,
  }
}

function renderDownloadBadge({ downloads }) {
  return {
    message: metric(downloads),
    color: downloadCountColor(downloads),
  }
}

function odataToObject(odata) {
  if (odata === undefined) {
    return undefined
  }

  const result = {}
  Object.entries(odata['m:properties']).forEach(([key, value]) => {
    const newKey = key.replace(/^d:/, '')
    result[newKey] = value
  })
  return result
}

module.exports = {
  renderVersionBadge,
  renderDownloadBadge,
  odataToObject,
}
