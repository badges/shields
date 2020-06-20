'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const {
  individualValueSchema,
  transformAndValidate,
  renderDynamicBadge,
} = require('../dynamic-common')
const { ConditionalGithubAuthV3Service } = require('./github-auth-service')
const { fetchJsonFromRepo } = require('./github-common-fetch')
const { documentation } = require('./github-helpers')

const schema = Joi.object({
  version: individualValueSchema,
}).required()

const queryParamSchema = Joi.object({
  file: Joi.string().regex(/.*manifest\.json$/),
})

const flexibleSchema = Joi.object().required()

class GithubManifestVersion extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github/manifest-json/v',
      pattern: ':user/:repo/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
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
          file: 'extension/manifest.json',
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
          file: 'extension/manifest.json',
        },
        staticPreview: this.render({ version: 2, branch: 'master' }),
        documentation,
      },
    ]
  }

  static render({ version, branch }) {
    return renderVersionBadge({
      version,
      tag: branch,
      defaultLabel: 'manifest',
    })
  }

  async handle({ user, repo, branch }, { file }) {
    const { version } = await fetchJsonFromRepo(this, {
      schema,
      user,
      repo,
      branch,
      filename: file || 'manifest.json',
    })
    return this.constructor.render({ version, branch })
  }
}

class DynamicGithubManifest extends ConditionalGithubAuthV3Service {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'github/manifest-json',
      pattern: ':key([^v/][^/]*)/:user/:repo/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
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
          file: 'extension/manifest.json',
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
          file: 'extension/manifest.json',
        },
        staticPreview: this.render({
          key: 'permissions',
          value: ['bundle', 'rollup', 'micro library'],
          branch: 'master',
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'manifest',
    }
  }

  static render({ key, value, branch }) {
    return renderDynamicBadge({
      defaultLabel: key,
      tag: branch,
      value,
    })
  }

  async handle({ key, user, repo, branch }, { file }) {
    // Not sure `manifest-json/n` was ever advertised, but it was supported.
    if (key === 'n') {
      key = 'name'
    }
    const data = await fetchJsonFromRepo(this, {
      schema: flexibleSchema,
      user,
      repo,
      branch,
      filename: file || 'manifest.json',
    })
    const value = transformAndValidate({ data, key })
    return this.constructor.render({ key, value, branch })
  }
}

module.exports = {
  GithubManifestVersion,
  DynamicGithubManifest,
}
