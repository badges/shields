import { metric } from './text-formatters.js'

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

export { contributorColor, renderContributorBadge }
