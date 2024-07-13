import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { InvalidResponse, pathParam, queryParam } from '../index.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchRepoContent } from './github-common-fetch.js'
import { documentation } from './github-helpers.js'

const queryParamSchema = Joi.object({
  filename: Joi.string(),
}).required()

const versionRegExp = /^Version:[\s]*(.+)$/m

const filenameDescription =
  'The `filename` param can be used to specify the path to `DESCRIPTION`. By default, we look for `DESCRIPTION` in the repo root'

export default class GithubRPackageVersion extends ConditionalGithubAuthV3Service {
  static category = 'version'

  static route = {
    base: 'github/r-package/v',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/github/r-package/v/{user}/{repo}': {
      get: {
        summary: 'GitHub R package version',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'mixOmicsTeam' }),
          pathParam({ name: 'repo', example: 'mixOmics' }),
          queryParam({
            name: 'filename',
            example: 'subdirectory/DESCRIPTION',
            description: filenameDescription,
          }),
        ],
      },
    },
    '/github/r-package/v/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub R package version (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'mixOmicsTeam' }),
          pathParam({ name: 'repo', example: 'mixOmics' }),
          pathParam({ name: 'branch', example: 'master' }),
          queryParam({
            name: 'filename',
            example: 'subdirectory/DESCRIPTION',
            description: filenameDescription,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'R' }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'R',
    })
  }

  static transform(content, filename) {
    const match = versionRegExp.exec(content)
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: `Version missing in ${filename}`,
      })
    }

    return {
      version: match[1],
    }
  }

  async handle({ user, repo, branch }, { filename = 'DESCRIPTION' }) {
    const content = await fetchRepoContent(this, {
      user,
      repo,
      branch,
      filename,
    })
    const { version } = this.constructor.transform(content, filename)
    return this.constructor.render({ version, branch })
  }
}
