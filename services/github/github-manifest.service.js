import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { renderVersionBadge } from '../version.js'
import {
  individualValueSchema,
  transformAndValidate,
  renderDynamicBadge,
} from '../dynamic-common.js'
import { ConditionalGithubAuthV3Service } from './github-auth-service.js'
import { fetchJsonFromRepo } from './github-common-fetch.js'
import { documentation } from './github-helpers.js'

const schema = Joi.object({
  version: individualValueSchema,
}).required()

const queryParamSchema = Joi.object({
  filename: Joi.string().regex(/.*manifest\.json$/),
})

const flexibleSchema = Joi.object().required()

class GithubManifestVersion extends ConditionalGithubAuthV3Service {
  static category = 'version'
  static route = {
    base: 'github/manifest-json/v',
    pattern: ':user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/github/manifest-json/v/{user}/{repo}': {
      get: {
        summary: 'GitHub manifest version',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'sindresorhus' }),
          pathParam({ name: 'repo', example: 'show-all-github-issues' }),
          queryParam({ name: 'filename', example: 'extension/manifest.json' }),
        ],
      },
    },
    '/github/manifest-json/v/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub manifest version (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'sindresorhus' }),
          pathParam({ name: 'repo', example: 'show-all-github-issues' }),
          pathParam({ name: 'branch', example: 'master' }),
          queryParam({ name: 'filename', example: 'extension/manifest.json' }),
        ],
      },
    },
  }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'manifest',
    })
  }

  async handle({ user, repo, branch }, { filename = 'manifest.json' }) {
    const { version } = await fetchJsonFromRepo(this, {
      schema,
      user,
      repo,
      branch,
      filename,
    })
    return this.constructor.render({ version, branch })
  }
}

class DynamicGithubManifest extends ConditionalGithubAuthV3Service {
  static category = 'other'
  static route = {
    base: 'github/manifest-json',
    pattern: ':key([^v/][^/]*)/:user/:repo/:branch*',
    queryParamSchema,
  }

  static openApi = {
    '/github/manifest-json/{key}/{user}/{repo}': {
      get: {
        summary: 'GitHub manifest.json dynamic',
        description: documentation,
        parameters: [
          pathParam({ name: 'key', example: 'permissions' }),
          pathParam({ name: 'user', example: 'sindresorhus' }),
          pathParam({ name: 'repo', example: 'show-all-github-issues' }),
          queryParam({ name: 'filename', example: 'extension/manifest.json' }),
        ],
      },
    },
    '/github/manifest-json/{key}/{user}/{repo}/{branch}': {
      get: {
        summary: 'GitHub manifest.json dynamic (branch)',
        description: documentation,
        parameters: [
          pathParam({ name: 'key', example: 'permissions' }),
          pathParam({ name: 'user', example: 'sindresorhus' }),
          pathParam({ name: 'repo', example: 'show-all-github-issues' }),
          pathParam({ name: 'branch', example: 'main' }),
          queryParam({ name: 'filename', example: 'extension/manifest.json' }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'manifest' }

  static render({ key, value, branch }) {
    return renderDynamicBadge({
      defaultLabel: key,
      tag: branch,
      value,
    })
  }

  async handle({ key, user, repo, branch }, { filename = 'manifest.json' }) {
    // Not sure `manifest-json/n` was ever advertised, but it was supported.
    if (key === 'n') {
      key = 'name'
    }
    const data = await fetchJsonFromRepo(this, {
      schema: flexibleSchema,
      user,
      repo,
      branch,
      filename,
    })
    const value = transformAndValidate({ data, key })
    return this.constructor.render({ key, value, branch })
  }
}

export { GithubManifestVersion, DynamicGithubManifest }
