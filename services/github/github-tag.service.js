'use strict'

const Joi = require('joi')
const { NotFound } = require('..')
const { addv } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const { latest } = require('../version')
const { GithubAuthService } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.alternatives()
  .try(
    Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
        })
      )
      .required(),
    Joi.array().length(0)
  )
  .required()

module.exports = class GithubTag extends GithubAuthService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'github',
      pattern: ':which(tag|tag-pre|tag-date)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub tag (latest SemVer)',
        pattern: 'tag/:user/:repo',
        namedParams: {
          user: 'expressjs',
          repo: 'express',
        },
        staticPreview: {
          label: 'tag',
          message: 'v4.16.4',
          color: 'blue',
        },
        documentation,
      },
      {
        title: 'GitHub tag (latest SemVer pre-release)',
        pattern: 'tag-pre/:user/:repo',
        namedParams: {
          user: 'expressjs',
          repo: 'express',
        },
        staticPreview: {
          label: 'tag',
          message: 'v5.0.0-alpha.7',
          color: 'orange',
        },
        documentation,
      },
      {
        title: 'GitHub tag (latest by date)',
        pattern: 'tag-date/:user/:repo',
        namedParams: {
          user: 'expressjs',
          repo: 'express',
        },
        staticPreview: {
          label: 'tag',
          message: 'v5.0.0-alpha.7',
          color: 'blue',
        },
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'tag' }
  }

  static render({ usingSemver, version }) {
    return {
      message: addv(version),
      color: usingSemver ? versionColor(version) : 'blue',
    }
  }

  static transform({ usingSemver, includePre, json }) {
    const versions = json.map(({ name }) => name)
    if (usingSemver) {
      return latest(versions, { pre: includePre })
    } else {
      return versions[0]
    }
  }

  async handle({ which, user, repo }) {
    const usingSemver = which !== 'tag-date'
    const includePre = which === 'tag-pre'

    const json = await this._requestJson({
      url: `/repos/${user}/${repo}/tags`,
      schema,
      errorMessages: errorMessagesFor(),
    })
    if (json.length === 0) {
      throw new NotFound({ prettyMessage: 'none' })
    }
    const version = this.constructor.transform({
      usingSemver,
      includePre,
      json,
    })
    return this.constructor.render({ usingSemver, version })
  }
}
