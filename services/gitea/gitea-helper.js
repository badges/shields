import { metric } from '../text-formatters.js'

const description = `
By default this badge looks for repositories on [gitea.com](https://gitea.com).
To specify another instance like [codeberg](https://codeberg.org/), [forgejo](https://forgejo.org/) or a self-hosted instance, use the \`gitea_url\` query param.
`

function httpErrorsFor(notFoundMessage = 'user or repo not found') {
  return {
    403: 'private repo',
    404: notFoundMessage,
  }
}

function renderIssue({ variant, labels, defaultBadgeData, count }) {
  const state = variant.split('-')[0]
  const raw = variant.endsWith('-raw')
  const isMultiLabel = labels && labels.includes(',')
  const labelText = labels ? `${isMultiLabel ? `${labels}` : labels} ` : ''

  let labelPrefix = ''
  let messageSuffix = ''
  if (raw) {
    labelPrefix = `${state} `
  } else {
    messageSuffix = state
  }
  return {
    label: `${labelPrefix}${labelText}${defaultBadgeData.label}`,
    message: `${metric(count)}${messageSuffix ? ' ' : ''}${messageSuffix}`,
    color: count > 0 ? 'yellow' : 'brightgreen',
  }
}

export { description, httpErrorsFor, renderIssue }
