'use strict'

const sg = require('simple-git')()
sg.env('GIT_TERMINAL_PROMPT', 0)
const { InvalidResponse, NotFound } = require('.')

async function getDefaultBranch({
  baseUrl,
  user,
  repo,
  username,
  password,
  simpleGit = sg,
}) {
  const url = new URL(baseUrl)
  url.pathname = `${user}/${repo}`

  let console_text
  try {
    const args = ['--symref', url.toString(), 'HEAD']
    if (username != null && password != null) {
      const authStr = Buffer.from(`${username}:${password}`).toString('base64')
      args.push('-c')
      args.push(`http.extraheader="Authorization: Basic ${authStr}"`)
    }
    console_text = await simpleGit.listRemote(args)
  } catch (e) {
    if (e.message.includes('could not read Username')) {
      throw new NotFound({ prettyMessage: 'repo not found or private' })
    }
    throw new InvalidResponse({ prettyMessage: 'invalid response data' })
  }

  const match = console_text.match(/^ref: refs\/heads\/([^\s]+)[\s]+HEAD/)
  if (match) {
    return match[1]
  }
  throw new InvalidResponse({ prettyMessage: 'invalid response data' })
}

module.exports = { getDefaultBranch }
