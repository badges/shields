'use strict'

const moment = require('moment')
const Joi = require('joi')
const { age } = require('../color-formatters')
const { formatDate } = require('../text-formatters')
const { GithubAuthService } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.alternatives(
  Joi.object({
    created_at: Joi.date().required(),
  }).required(),
  Joi.array()
    .items(
      Joi.object({
        created_at: Joi.date().required(),
      }).required()
    )
    .min(1)
)

module.exports = class GithubReleaseDate extends GithubAuthService {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github',
      pattern: ':which(release-date|release-date-pre)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Release Date',
        pattern: 'release-date/:user/:repo',
        namedParams: {
          user: 'SubtitleEdit',
          repo: 'subtitleedit',
        },
        staticPreview: this.render({ date: '2017-04-13T07:50:27.000Z' }),
        documentation,
      },
      {
        title: 'GitHub (Pre-)Release Date',
        pattern: 'release-date-pre/:user/:repo',
        namedParams: {
          user: 'Cockatrice',
          repo: 'Cockatrice',
        },
        staticPreview: this.render({ date: '2017-04-13T07:50:27.000Z' }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'release date',
    }
  }

  static render({ date }) {
    const releaseDate = moment(date)
    return {
      message: formatDate(releaseDate),
      color: age(releaseDate),
    }
  }

  async fetch({ which, user, repo }) {
    const url =
      which === 'release-date'
        ? `/repos/${user}/${repo}/releases/latest`
        : `/repos/${user}/${repo}/releases`
    return this._requestJson({
      url,
      schema,
      errorMessages: errorMessagesFor('no releases or repo not found'),
    })
  }

  async handle({ which, user, repo }) {
    const body = await this.fetch({ which, user, repo })
    if (Array.isArray(body)) {
      return this.constructor.render({ date: body[0].created_at })
    }
    return this.constructor.render({ date: body.created_at })
  }
}
