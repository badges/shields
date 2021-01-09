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

function renderContributorBadgeWithLink({ label, contributorCount, link }) {
  const contributorBadge = renderContributorBadge({ label, contributorCount })
  contributorBadge.link = link
  return contributorBadge
}

module.exports = {
  contributorColor,
  renderContributorBadge,
  renderContributorBadgeWithLink,
}
