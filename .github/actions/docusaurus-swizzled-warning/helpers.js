'use strict'

/**
 * Returns info about all files changed in a PR (max 3000 results)
 *
 * @param {object} client hydrated octokit ready to use for GitHub Actions
 * @param {string} owner repo owner
 * @param {string} repo repo name
 * @param {number} pullNumber pull request number
 * @returns {object[]} array of object that describe pr changed files - see https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests-files
 */
async function getAllFilesForPullRequest(client, owner, repo, pullNumber) {
  const perPage = 100 // Max number of items per page
  let page = 1 // Start with the first page
  let allFiles = []
  while (true) {
    const response = await client.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: perPage,
      page,
    })

    if (response.data.length === 0) {
      // Break the loop if no more results
      break
    }

    allFiles = allFiles.concat(response.data)
    page++ // Move to the next page
  }
  return allFiles
}

/**
 * Get a list of files changed betwen two tags for a github repo
 *
 * @param {object} client hydrated octokit ready to use for GitHub Actions
 * @param {string} owner repo owner
 * @param {string} repo repo name
 * @param {string} baseTag base tag
 * @param {string} headTag head tag
 * @returns {string[]} Array listing all changed files betwen the base tag and the head tag
 */
async function getChangedFilesBetweenTags(
  client,
  owner,
  repo,
  baseTag,
  headTag,
) {
  const response = await client.rest.repos.compareCommits({
    owner,
    repo,
    base: baseTag,
    head: headTag,
  })

  return response.data.files.map(file => file.filename)
}

function findKeyEndingWith(obj, ending) {
  for (const key in obj) {
    if (key.endsWith(ending)) {
      return key
    }
  }
}

/**
 * Get large (>1MB) JSON file from git repo on at ref as a json object
 *
 * @param {object} client Hydrated octokit ready to use for GitHub Actions
 * @param {string} owner Repo owner
 * @param {string} repo Repo name
 * @param {string} path Path of the file in repo relative to root directory
 * @param {string} ref Git refrence (commit, branch, tag)
 * @returns {string[]} Array listing all changed files betwen the base tag and the head tag
 */
async function getLargeJsonAtRef(client, owner, repo, path, ref) {
  const fileSha = (
    await client.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    })
  ).data.sha
  const fileBlob = (
    await client.rest.git.getBlob({
      owner,
      repo,
      file_sha: fileSha,
    })
  ).data.content
  return JSON.parse(Buffer.from(fileBlob, 'base64').toString())
}

module.exports = {
  getAllFilesForPullRequest,
  getChangedFilesBetweenTags,
  findKeyEndingWith,
  getLargeJsonAtRef,
}
