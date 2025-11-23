import { getInput, info, setFailed } from '@actions/core'
import { getOctokit, context } from '@actions/github'
import {
  getAllFilesForPullRequest,
  getChangedFilesBetweenTags,
  findKeyEndingWith,
  getLargeJsonAtRef,
} from './helpers.js'

async function run() {
  try {
    const token = getInput('github-token', { required: true })

    const { pull_request: pr } = context.payload
    if (!pr) {
      throw new Error('Event payload missing `pull_request`')
    }

    const client = getOctokit(token)
    const packageName = 'docusaurus-theme-openapi'
    const packageParentName = 'docusaurus-preset-openapi'
    const overideComponents = ['Curl', 'Response']
    const messageTemplate = `<table><thead><tr><th colspan="2">
      ⚠️ This PR contains changes to components of ${packageName} we've overridden
    </th></tr>
    <tr><th colspan="2">
      We need to watch out for changes to the ${overideComponents.join(
        ', ',
      )} components
    </th></tr></thead>
    `

    if (
      !['dependabot[bot]', 'dependabot-preview[bot]'].includes(pr.user.login)
    ) {
      return
    }
    const files = await getAllFilesForPullRequest(
      client,
      context.repo.owner,
      context.repo.repo,
      pr.number,
    )

    const file = files.filter(f => f.filename === 'package-lock.json')[0]
    if (file === undefined) {
      return
    }

    const prCommitRefForFile = file.contents_url.split('ref=')[1]
    const pkgLockNewJson = await getLargeJsonAtRef(
      client,
      context.repo.owner,
      context.repo.repo,
      file.filename,
      prCommitRefForFile,
    )
    const pkgLockOldJson = await getLargeJsonAtRef(
      client,
      context.repo.owner,
      context.repo.repo,
      file.filename,
      'master',
    )

    const oldVesionModuleKey = findKeyEndingWith(
      pkgLockOldJson.packages,
      `node_modules/${packageName}`,
    )
    const newVesionModuleKey = findKeyEndingWith(
      pkgLockNewJson.packages,
      `node_modules/${packageName}`,
    )
    let oldVersion = pkgLockOldJson.packages[oldVesionModuleKey].version
    let newVersion = pkgLockNewJson.packages[newVesionModuleKey].version

    const oldVesionModuleKeyParent = findKeyEndingWith(
      pkgLockOldJson.packages,
      `node_modules/${packageParentName}`,
    )
    const newVesionModuleKeyParent = findKeyEndingWith(
      pkgLockNewJson.packages,
      `node_modules/${packageParentName}`,
    )
    const oldVersionParent =
      pkgLockOldJson.packages[oldVesionModuleKeyParent].dependencies[
        packageName
      ].substring(1)
    const newVersionParent =
      pkgLockNewJson.packages[newVesionModuleKeyParent].dependencies[
        packageName
      ].substring(1)

    // if parent dependency is higher version then existing
    // npm install will retrive the newer version from the parent dependency
    if (oldVersionParent > oldVersion) {
      oldVersion = oldVersionParent
    }
    if (newVersionParent > newVersion) {
      newVersion = newVersionParent
    }
    info(`oldVersion=${oldVersion}`)
    info(`newVersion=${newVersion}`)

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
      const versionReport = `<tbody><tr><td> Old version </td><td> ${oldVersion} </td></tr>
      <tr><td> New version </td><td> ${newVersion} </td></tr>
      `
      const changedComponentsReport = `<tr><td> Overide components changed </td><td> ${changedComponents.join(
        ', ',
      )} </td></tr></tbody></table>
      `
      const body = messageTemplate + versionReport + changedComponentsReport
      await client.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pr.number,
        body,
      })

      info('Found changes and posted comment, done.')
      return
    }

    info('No changes found, done.')
  } catch (error) {
    setFailed(error.message)
  }
}

run()
