'use strict'

const COLOR_MAP = {
  compliant: 'brightgreen',
  'non-compliant': 'red',
}

function renderReuseBadge({ status }) {
  return {
    label: 'reuse',
    message: status,
    color: COLOR_MAP[status],
  }
}

module.exports = {
  renderReuseBadge,
}
