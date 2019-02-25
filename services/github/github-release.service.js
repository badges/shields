'use strict'

const Joi = require('joi')
const { addv } = require('../../lib/text-formatters')
const { GithubAuthService } = require('./github-auth-service')
const { errorMessagesFor, documentation } = require('./github-helpers')

const releaseInfoSchema = Joi.object({
  tag_name: Joi.string().required(),
  prerelease: Joi.boolean().required(),
}).required()
const releaseInfoArraySchema = Joi.array()
  .items(releaseInfoSchema)
  .required()

module.exports = class GithubRelease extends GithubAuthService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github',
      pattern: ':which(release|release-pre)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub release',
        namedParams: {
          which: 'release',
          user: 'qubyte',
          repo: 'rubidium',
        },
        staticPreview: this.render({ version: '2.0.2', isPrerelease: false }),
        documentation,
      },
    ]
  }

  async fetch({ user, repo, includePre }) {
    if (includePre) {
      const [releaseInfo] = await this._requestJson({
        schema: releaseInfoArraySchema,
        url: `/repos/${user}/${repo}/releases`,
        errorMessages: errorMessagesFor(),
      })
      return releaseInfo
    } else {
      const releaseInfo = await this._requestJson({
        schema: releaseInfoSchema,
        url: `/repos/${user}/${repo}/releases/latest`,
        errorMessages: errorMessagesFor('no releases or repo not found'),
      })
      return releaseInfo
    }
  }

  static get defaultBadgeData() {
    return {
      label: 'release',
      namedLogo: 'github',
    }
  }

  static render({ version, isPrerelease }) {
    return {
      message: addv(version),
      color: isPrerelease ? 'orange' : 'blue',
    }
  }

  async handle({ which, user, repo }) {
    const { tag_name: version, prerelease: isPrerelease } = await this.fetch({
      user,
      repo,
    })
    return this.constructor.render({ version, isPrerelease })
  }
}
