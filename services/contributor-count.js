'use strict'

const { metric } = require('./text-formatters')

function contributorColor(contributorCount) {
  if (contributorCount > 2) {
    return 'brightgreen'
  } else if (contributorCount === 2) {
    return 'yellow'
  } else {
    return 'red'
  }
}

function renderContributorBadge({ label, contributorCount }) {
  return {
    label,
    message: metric(contributorCount),
    color: contributorColor(contributorCount),
  }
}

module.exports = {
  contributorColor,
  renderContributorBadge,
}
