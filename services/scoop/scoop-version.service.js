import Joi from 'joi'
import { NotFound, pathParam, queryParam } from '../index.js'
import { ConditionalGithubAuthV3Service } from '../github/github-auth-service.js'
import { fetchJsonFromRepo } from '../github/github-common-fetch.js'
import { renderVersionBadge } from '../version.js'

const gitHubRepoRegExp =
  /https:\/\/github.com\/(?<user>.*?)\/(?<repo>.*?)(\/|$)/
const bucketsSchema = Joi.object()
  .pattern(/.+/, Joi.string().pattern(gitHubRepoRegExp).required())
  .required()
const scoopSchema = Joi.object({
  version: Joi.string().required(),
}).required()
const queryParamSchema = Joi.object({
  bucket: Joi.string(),
})

export default class ScoopVersion extends ConditionalGithubAuthV3Service {
  // The buckets file (https://github.com/lukesampson/scoop/blob/master/buckets.json) changes very rarely.
  // Cache it for the lifetime of the current Node.js process.
  buckets = null

  static category = 'version'

  static route = {
    base: 'scoop/v',
    pattern: ':app',
    queryParamSchema,
  }

  static openApi = {
    '/scoop/v/{app}': {
      get: {
        summary: 'Scoop Version',
        description:
          '[Scoop](https://scoop.sh/) is a command-line installer for Windows',
        parameters: [
          pathParam({ name: 'app', example: 'ngrok' }),
          queryParam({ name: 'bucket', example: 'extras' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'scoop' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ app }, queryParams) {
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
    const bucketUrl = this.buckets[bucket]
    if (!bucketUrl) {
      throw new NotFound({ prettyMessage: `bucket "${bucket}" not found` })
    }
    const {
      groups: { user, repo },
    } = gitHubRepoRegExp.exec(bucketUrl)
    try {
      const { version } = await fetchJsonFromRepo(this, {
        schema: scoopSchema,
        user,
        repo,
        branch: 'master',
        filename: `bucket/${app}.json`,
      })
      return this.constructor.render({ version })
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
