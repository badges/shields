'use strict'

const core = require('@actions/core')
const github = require('@actions/github')
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
    const packageName = 'docusaurus-preset-openapi'
    const overideComponents = ['Curl', 'Response']
    const messageTemplate = `
    | :large_orange_diamond:This PR contains changes to components of ${packageName} we've overridden |
    ---------------------------------------------------------------------------------------------------
    | We need to watch out for changes to the Curl and Response components |
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
        if (!['package.json', 'package-lock.json'].includes(file.filename)) {
          continue
        }

        const patchLines = file.patch.split('\n')
        const versionRegex = /\d+\.\d+\.\d+/

        let oldVersion
        let newVersion

        for (let i = 0; i < patchLines.length; i++) {
          if (
            ['+', '-'].includes(patchLines[i][0]) &&
            patchLines[i].includes(packageName)
          ) {
            const match = patchLines[i].match(versionRegex)
            if (patchLines[i][0] === '+') {
              newVersion = match[0]
            } else {
              oldVersion = match[0]
            }
          }
        }

        if (newVersion) {
          const pkgChangedFiles = await getChangedFilesBetweenTags(
            client,
            'cloud-annotations',
            'docusaurus-openapi',
            `v${newVersion}`,
            `v${oldVersion}`,
          )
          const changedComponents = overideComponents.filter(
            componenet =>
              pkgChangedFiles.filter(
                path =>
                  path.includes('docusaurus-theme-openapi/src/theme') &&
                  path.includes(componenet),
              ).length > 0,
          )
          const versionReport = `| Old version | ${oldVersion} |
          | New version | ${newVersion} |
          `
          const changedComponentsReport = `| Overide components changed | ${changedComponents.join(
            ', ',
          )} |
          `
          const body = messageTemplate + versionReport + changedComponentsReport
          await client.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: pr.number,
            body,
          })
        }

        core.debug('Found changes and posted comment, done.')
        return
      }
      core.debug('No changes found, done.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
