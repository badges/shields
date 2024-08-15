import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { InvalidResponse, pathParam, queryParam } from '../index.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchRepoContent } from './github-common-fetch.js'
import { documentation } from './github-helpers.js'

const queryParamSchema = Joi.object({
  filename: Joi.string(),
}).required()

const goVersionRegExp = /^go ([^/\s]+)(\s*\/.+)?$/m

const filenameDescription =
  'The `filename` param can be used to specify the path to `go.mod`. By default, we look for `go.mod` in the repo root'

export default class GithubGoModGoVersion extends ConditionalGithubAuthV3Service {
  static category = 'platform-support'
  static route = {
    base: 'github/go-mod/go-version',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/github/go-mod/go-version/{user}/{repo}': {
      get: {
        summary: 'GitHub go.mod Go version',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'gohugoio' }),
          pathParam({ name: 'repo', example: 'hugo' }),
          queryParam({
            name: 'filename',
            example: 'src/go.mod',
            description: filenameDescription,
          }),
        ],
      },
    },
    '/github/go-mod/go-version/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub go.mod Go version (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'gohugoio' }),
          pathParam({ name: 'repo', example: 'hugo' }),
          pathParam({ name: 'branch', example: 'master' }),
          queryParam({
            name: 'filename',
            example: 'src/go.mod',
            description: filenameDescription,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'Go' }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'Go',
    })
  }

  static transform(content) {
    const match = goVersionRegExp.exec(content)
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: 'Go version missing in go.mod',
      })
    }

    return {
      go: match[1],
    }
  }

  async handle({ user, repo, branch }, { filename = 'go.mod' }) {
    const content = await fetchRepoContent(this, {
      user,
      repo,
      branch,
      filename,
    })
    const { go } = this.constructor.transform(content)
    return this.constructor.render({ version: go, branch })
  }
}
