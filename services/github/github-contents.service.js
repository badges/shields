import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import { documentation, httpErrorsFor } from './github-helpers.js'

const queryParamSchema = Joi.object({
  branch: Joi.string(),
}).required()

const schema = Joi.object({
  content: Joi.string().required(),
  encoding: Joi.equal('base64').required(),
}).required()

export default class GithubContents extends GithubAuthV3Service {
  static category = 'data'

  static route = {
    base: 'github/contents',
    pattern: ':user/:repo/:path+',
    queryParamSchema,
  }

  static openApi = {
    '/github/contents/{user}/{repo}/{path}': {
      get: {
        summary: 'GitHub file contents',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'expressjs' }),
          pathParam({ name: 'repo', example: 'express' }),
          pathParam({ name: 'path', example: 'package.json' }),
          queryParam({
            name: 'branch',
            example: 'master',
            description: 'Can be a branch, a tag or a commit hash.',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'contents',
  }

  async fetch({ user, repo, path, branch }) {
    const options = {}
    if (branch) {
      options.searchParams = { ref: branch }
    }

    return this._requestJson({
      url: `/repos/${user}/${repo}/contents/${path}`,
      schema,
      options,
      httpErrors: httpErrorsFor('repo, branch or file not found'),
    })
  }

  async handle({ user, repo, path }, queryParams) {
    const branch = queryParams.branch
    const { content, encoding } = await this.fetch({ user, repo, path, branch })

    if (encoding !== 'base64') {
      throw new Error('Unexpected encoding')
    }

    const buffer = Buffer.from(content, 'base64')
    return { message: buffer.toString('utf-8') }
  }
} 