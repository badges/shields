'use strict'

const COLOR_MAP = {
  checking: 'brightgreen',
  compliant: 'green',
  'non-compliant': 'red',
  unregistered: 'red',
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
