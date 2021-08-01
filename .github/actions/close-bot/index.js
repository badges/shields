'use strict'

const core = require('@actions/core')
const github = require('@actions/github')
const { isPointlessVersionBump } = require('./helpers')

async function run() {
  try {
    const token = core.getInput('github-token', { required: true })

    const { pull_request: pr } = github.context.payload
    if (!pr) {
      throw new Error('Event payload missing `pull_request`')
    }

    const client = github.getOctokit(token)

    if (
      ['dependabot[bot]', 'dependabot-preview[bot]'].includes(pr.user.login)
    ) {
      if (isPointlessVersionBump(pr.body)) {
        core.debug(`Closing pull request #${pr.number}`)
        await client.rest.pulls.update({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          pull_number: pr.number,
          state: 'closed',
        })

        core.debug(`Done.`)
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
