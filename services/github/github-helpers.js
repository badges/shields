import { colorScale } from '../color-formatters.js'
import { InvalidResponse, NotFound } from '../index.js'

const documentation = `
You can help increase Shields.io's rate limit by
[authorizing the Shields.io GitHub application](https://img.shields.io/github-auth).
Read more about [how it works](/blog/token-pool).
`

function issueStateColor(s) {
  return { open: '2cbe4e', closed: '6f42c1' }[s]
}

function httpErrorsFor(notFoundMessage = 'repo not found') {
  return {
    404: notFoundMessage,
    422: notFoundMessage,
  }
}

function transformErrors(errors, entity = 'repo') {
  if (errors[0].type === 'NOT_FOUND') {
    return new NotFound({ prettyMessage: `${entity} not found` })
  } else {
    return new InvalidResponse({ prettyMessage: errors[0].message })
  }
}

const commentsColor = colorScale([1, 3, 10, 25], undefined, true)

export {
  documentation,
  issueStateColor,
  commentsColor,
  httpErrorsFor,
  transformErrors,
}
