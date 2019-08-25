'use strict'

const { test, given, forCases } = require('sazerac')
const GitHubActions = require('./github-actions.service')

describe('GitHubActions', function() {
  test(GitHubActions.render, () => {
    forCases([
      given({
        status: 'queued',
        conclusion: null,
      }),
      given({
        status: 'pending',
        conclusion: null,
      }),
    ]).expect({
      message: 'in progress',
    })
  })
})
