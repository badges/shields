'use strict'

const serverSecrets = require('../../lib/server-secrets')
const { colorScale } = require('../color-formatters')

const documentation = `
<p>
  If your GitHub badge errors, it might be because you hit GitHub's rate limits.
  <br>
  You can increase Shields.io's rate limit by
  <a href="https://img.shields.io/github-auth">going to this page</a> to add
  Shields as a GitHub application on your GitHub account.
</p>
`

function stateColor(s) {
  return { open: '2cbe4e', closed: 'cb2431', merged: '6f42c1' }[s]
}

function errorMessagesFor(notFoundMessage = 'repo not found') {
  return {
    404: notFoundMessage,
    422: notFoundMessage,
  }
}

const commentsColor = colorScale([1, 3, 10, 25], undefined, true)

function staticAuthConfigured() {
  return Boolean(serverSecrets.gh_token)
}

module.exports = {
  documentation,
  stateColor,
  commentsColor,
  errorMessagesFor,
  staticAuthConfigured,
}
