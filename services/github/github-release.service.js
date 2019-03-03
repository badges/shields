'use strict'

const Joi = require('joi')
const { addv } = require('../text-formatters')
const { latest: latestVersion } = require('../version')
const { version: versionColor } = require('../color-formatters')
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
      pattern: ':which(release|release-pre|release-latest)/:user/:repo',
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
        staticPreview: this.render('2.0.2'),
        documentation,
      },
    ]
  }

  async fetch({ user, repo, which }) {
    const commonAttrs = {
      errorMessages: errorMessagesFor('no releases or repo not found'),
    }
    if (which.endsWith('latest')) {
      const releaseInfo = [
        await this._requestJson({
          schema: releaseInfoSchema,
          url: `/repos/${user}/${repo}/releases/latest`,
          ...commonAttrs,
        }),
      ]
      return releaseInfo
    } else {
      const releaseInfo = await this._requestJson({
        schema: releaseInfoArraySchema,
        url: `/repos/${user}/${repo}/releases`,
        ...commonAttrs,
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

  static render(version) {
    return {
      message: addv(version),
      color: versionColor(version),
    }
  }

  async handle({ which, user, repo }) {
    const releaseInfo = await this.fetch({
      user,
      repo,
      which,
    })

    const versions = releaseInfo.map(e => e.tag_name)
    const version = latestVersion(versions, { pre: which.endsWith('pre') })

    console.log('version:', version)
    return this.constructor.render(version)
  }
}
