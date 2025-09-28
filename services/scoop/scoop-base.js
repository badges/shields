import Joi from 'joi'
import { ConditionalGithubAuthV3Service } from '../github/github-auth-service.js'
import { fetchJsonFromRepo } from '../github/github-common-fetch.js'
import { NotFound } from '../index.js'

const gitHubRepoRegExp =
  /https:\/\/github.com\/(?<user>.*?)\/(?<repo>.*?)(\/|$)/

const bucketsSchema = Joi.object()
  .pattern(/.+/, Joi.string().pattern(gitHubRepoRegExp).required())
  .required()

export const queryParamSchema = Joi.object({
  bucket: Joi.string(),
})

export class ScoopBase extends ConditionalGithubAuthV3Service {
  // The buckets file (https://github.com/lukesampson/scoop/blob/master/buckets.json) changes very rarely.
  // Cache it for the lifetime of the current Node.js process.
  buckets = null

  async fetch({ app, schema }, queryParams) {
    if (!this.buckets) {
      this.buckets = await fetchJsonFromRepo(this, {
        schema: bucketsSchema,
        user: 'ScoopInstaller',
        repo: 'Scoop',
        branch: 'master',
        filename: 'buckets.json',
      })
    }
    const bucket = queryParams.bucket || 'main'
    let bucketUrl = this.buckets[bucket]
    if (!bucketUrl) {
      // Parsing URL here will throw an error if the url is invalid
      try {
        const url = new URL(decodeURIComponent(bucket))

        // Throw errors to go to jump to catch statement
        // The error messages here are purely for code readability, and will never reach the user.
        if (url.hostname !== 'github.com') {
          throw new Error('Not a GitHub URL')
        }
        const path = url.pathname.split('/').filter(value => value !== '')

        if (path.length !== 2) {
          throw new Error('Not a valid GitHub Repo')
        }

        const [user, repo] = path

        // Reconstructing the url here ensures that the url will match the regex
        bucketUrl = `https://github.com/${user}/${repo}`
      } catch (e) {
        throw new NotFound({ prettyMessage: `bucket "${bucket}" not found` })
      }
    }
    const {
      groups: { user, repo },
    } = gitHubRepoRegExp.exec(bucketUrl)
    try {
      return await fetchJsonFromRepo(this, {
        schema,
        user,
        repo,
        branch: 'master',
        filename: `bucket/${app}.json`,
      })
    } catch (error) {
      if (error instanceof NotFound) {
        throw new NotFound({
          prettyMessage: `${app} not found in bucket "${bucket}"`,
        })
      }
      throw error
    }
  }
}

export const description =
  '[Scoop](https://scoop.sh/) is a command-line installer for Windows'
