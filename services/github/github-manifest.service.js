import Joi from 'joi'
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

  static examples = [
    {
      title: 'GitHub manifest version',
      pattern: ':user/:repo',
      namedParams: {
        user: 'sindresorhus',
        repo: 'show-all-github-issues',
      },
      staticPreview: this.render({ version: '1.0.3' }),
      documentation,
    },
    {
      title: 'GitHub manifest version',
      pattern: ':user/:repo/:branch',
      namedParams: {
        user: 'sindresorhus',
        repo: 'show-all-github-issues',
        branch: 'master',
      },
      staticPreview: this.render({ version: '1.0.3', branch: 'master' }),
      documentation,
    },
    {
      title: 'GitHub manifest version (path)',
      pattern: ':user/:repo',
      namedParams: {
        user: 'RedSparr0w',
        repo: 'IndieGala-Helper',
      },
      queryParams: {
        filename: 'extension/manifest.json',
      },
      staticPreview: this.render({ version: 2 }),
      documentation,
    },
    {
      title: 'GitHub manifest version (path)',
      pattern: ':user/:repo/:branch',
      namedParams: {
        user: 'RedSparr0w',
        repo: 'IndieGala-Helper',
        branch: 'master',
      },
      queryParams: {
        filename: 'extension/manifest.json',
      },
      staticPreview: this.render({ version: 2, branch: 'master' }),
      documentation,
    },
  ]

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

  static examples = [
    {
      title: 'GitHub manifest.json dynamic',
      pattern: ':key/:user/:repo',
      namedParams: {
        key: 'permissions',
        user: 'sindresorhus',
        repo: 'show-all-github-issues',
      },
      staticPreview: this.render({
        key: 'permissions',
        value: ['webRequest', 'webRequestBlocking'],
      }),
      documentation,
    },
    {
      title: 'GitHub manifest.json dynamic',
      pattern: ':key/:user/:repo/:branch',
      namedParams: {
        key: 'permissions',
        user: 'sindresorhus',
        repo: 'show-all-github-issues',
        branch: 'master',
      },
      staticPreview: this.render({
        key: 'permissions',
        value: ['webRequest', 'webRequestBlocking'],
        branch: 'master',
      }),
      documentation,
    },
    {
      title: 'GitHub manifest.json dynamic (path)',
      pattern: ':key/:user/:repo',
      namedParams: {
        key: 'permissions',
        user: 'RedSparr0w',
        repo: 'IndieGala-Helper',
      },
      queryParams: {
        filename: 'extension/manifest.json',
      },
      staticPreview: this.render({
        key: 'permissions',
        value: ['bundle', 'rollup', 'micro library'],
      }),
      documentation,
    },
    {
      title: 'GitHub manifest.json dynamic (path)',
      pattern: ':key/:user/:repo/:branch',
      namedParams: {
        key: 'permissions',
        user: 'RedSparr0w',
        repo: 'IndieGala-Helper',
        branch: 'master',
      },
      queryParams: {
        filename: 'extension/manifest.json',
      },
      staticPreview: this.render({
        key: 'permissions',
        value: ['bundle', 'rollup', 'micro library'],
        branch: 'master',
      }),
      documentation,
    },
  ]

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
