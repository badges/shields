'use strict'

const core = require('@actions/core')
const github = require('@actions/github')
const fetch = require('node-fetch')
const {
  getAllFilesForPullRequest,
  getChangedFilesBetweenTags,
} = require('./helpers')

async function run() {
  try {
    const token = core.getInput('github-token', { required: true })

    const { pull_request: pr } = github.context.payload
    if (!pr) {
      throw new Error('Event payload missing `pull_request`')
    }

    const client = github.getOctokit(token)
    const packageName = 'docusaurus-theme-openapi'
    const overideComponents = ['Curl', 'Response']
    const messageTemplate = `<table><thead><tr><th>
      ⚠️ This PR contains changes to components of ${packageName} we've overridden
    </th></tr></thead>
    <tbody><tr><th>
      We need to watch out for changes to the ${overideComponents.join(
        ', ',
      )}components
    </th></tr>
    `

    if (
      ['dependabot[bot]', 'dependabot-preview[bot]'].includes(pr.user.login)
    ) {
      const files = await getAllFilesForPullRequest(
        client,
        github.context.repo.owner,
        github.context.repo.repo,
        pr.number,
      )

      for (const file of files) {
        if (file.filename !== 'package-lock.json') {
          continue
        }

        const pkgLockNewJson = await (await fetch(file.raw_url)).json()
        const pkgLockOldJson = await (
          await fetch(
            `https://raw.githubusercontent.com/${github.context.repo.owner}/${github.context.repo.repo}/master/${file.filename}`,
          )
        ).json()
        const oldVersion =
          pkgLockOldJson.packages[`node_modules/${packageName}`].version
        const newVersion =
          pkgLockNewJson.packages[`node_modules/${packageName}`].version

        if (newVersion !== oldVersion) {
          const pkgChangedFiles = await getChangedFilesBetweenTags(
            client,
            'cloud-annotations',
            'docusaurus-openapi',
            `v${oldVersion}`,
            `v${newVersion}`,
          )
          const changedComponents = overideComponents.filter(
            componenet =>
              pkgChangedFiles.filter(
                path =>
                  path.includes('docusaurus-theme-openapi/src/theme') &&
                  path.includes(componenet),
              ).length > 0,
          )
          const versionReport = `<tr><th> Old version </th><th> ${oldVersion} </th></tr>
          <tr><th> New version </th><th> ${newVersion} </th></tr>
          `
          const changedComponentsReport = `<tr><th> Overide components changed </th><th> ${changedComponents.join(
            ', ',
          )} </th></tr></tbody></table>
          `
          const body = messageTemplate + versionReport + changedComponentsReport
          await client.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: pr.number,
            body,
          })

          core.debug('Found changes and posted comment, done.')
          return
        }
      }
      core.debug('No changes found, done.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
