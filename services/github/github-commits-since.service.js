'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthService } = require('./github-auth-service')
const { fetchLatestRelease } = require('./github-common-fetch')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({ ahead_by: nonNegativeInteger }).required()

module.exports = class GithubCommitsSince extends GithubAuthService {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github/commits-since',
      pattern: ':user/:repo/:version',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub commits since tagged version',
        namedParams: {
          user: 'SubtitleEdit',
          repo: 'subtitleedit',
          version: '3.4.7',
        },
        staticPreview: this.render({
          version: '3.4.7',
          commitCount: 4225,
        }),
        documentation,
      },
      {
        title: 'GitHub commits since latest release',
        namedParams: {
          user: 'SubtitleEdit',
          repo: 'subtitleedit',
          version: 'latest',
        },
        staticPreview: this.render({
          version: '3.5.7',
          commitCount: 157,
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'github',
      namedLogo: 'github',
    }
  }

  static render({ version, commitCount }) {
    return {
      label: `commits since ${version}`,
      message: metric(commitCount),
      color: 'blue',
    }
  }

  async handle({ user, repo, version }) {
    if (version === 'latest') {
      ;({ tag_name: version } = await fetchLatestRelease(this, {
        user,
        repo,
      }))
    }

    const { ahead_by: commitCount } = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}/compare/${version}...master`,
      errorMessages: errorMessagesFor('repo or version not found'),
    })

    return this.constructor.render({ version, commitCount })
  }
}
