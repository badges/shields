'use strict'

const Joi = require('@hapi/joi')
const prettyBytes = require('pretty-bytes')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')
const { NotFound } = require('..')

const schema = Joi.alternatives(
  Joi.object({
    size: nonNegativeInteger,
  }).required(),
  Joi.array().required()
)

module.exports = class GithubSize extends GithubAuthV3Service {
  static get category() {
    return 'size'
  }

  static get route() {
    return {
      base: 'github/size',
      pattern: ':user/:repo/:path*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub file size in bytes',
        namedParams: {
          user: 'webcaetano',
          repo: 'craft',
          path: 'build/phaser-craft.min.js',
        },
        staticPreview: this.render({ size: 9170 }),
        keywords: ['repo'],
        documentation,
      },
    ]
  }

  static render({ size }) {
    return {
      message: prettyBytes(size),
      color: 'blue',
    }
  }

  async fetch({ user, repo, path }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/contents/${path}`,
      schema,
      errorMessages: errorMessagesFor('repo or file not found'),
    })
  }

  async handle({ user, repo, path }) {
    const body = await this.fetch({ user, repo, path })
    if (Array.isArray(body)) {
      throw new NotFound({ prettyMessage: 'not a regular file' })
    }
    return this.constructor.render({ size: body.size })
  }
}
