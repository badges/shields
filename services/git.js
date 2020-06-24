'use strict'

const sg = require('simple-git')()
const { InvalidResponse, NotFound } = require('.')

async function getDefaultBranch({
  baseUrl,
  user,
  repo,
  username = '',
  password = '',
  simpleGit = sg,
}) {
  /*
  Note on authentication: if we pass the function a valid
  username and password, they will be used:
  https://username:password@github.com/badges/shields.git
  This could be useful where we've got
  BITBUCKET_USER / BITBUCKET_PASS set, for example.

  If username and password aren't specified,
  we will intentionally pass blank credentials:
  https://:@github.com/badges/shields.git
  This might seem like a bad idea at first, but if we pass no credentials at all
  `git ls-remote --symref https://github.com/badges/shields.git HEAD`
  will work, but
  `git ls-remote --symref https://github.com/foobar/does-not-exist.git HEAD`
  will leave us sitting at an interactive prompt
  `Username for 'https://github.com':`
  waiting for input that is never going to arrive.

  If we pass a set of intentionally blank credentials,
  `git ls-remote --symref https://:@github.com/badges/shields.git HEAD`
  still works fine for a public repo, but
  `git ls-remote --symref https://:@github.com/foobar/does-not-exist.git HEAD`
  will instantly fail on the assumption that the repo either doesn't exist,
  or it does but we don't have access to it. Either way simple-git
  will throw a `GitError: remote: HTTP Basic: Access denied`
  which we can catch and re-throw as NotFound rather than sitting at a
  login prompt forever.

  So from outside, omitting the username and password params allows us to
  query public repos only, failing if the repo is not found/private,
  which is what we'd expect.
  */
  const url = `${baseUrl
    .replace(/\/$/, '')
    .replace('://', `://${username}:${password}@`)}/${user}/${repo}`

  let console_text
  try {
    console_text = await simpleGit.listRemote(['--symref', url, 'HEAD'])
  } catch (e) {
    // GitError
    throw new NotFound({ prettyMessage: 'repo not found' })
  }

  const match = console_text.match(/^ref: refs\/heads\/([^\s]+)[\s]+HEAD/)
  if (match) {
    return match[1]
  }
  throw new InvalidResponse({ prettyMessage: 'invalid response data' })
}

module.exports = { getDefaultBranch }
