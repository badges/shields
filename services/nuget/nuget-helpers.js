'use strict'

const { metric, addv } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')

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

module.exports = {
  renderVersionBadge,
  renderDownloadBadge,
}
