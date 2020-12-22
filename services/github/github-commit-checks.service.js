'use strict'

const Joi = require('joi')
const { NotFound, InvalidParameter } = require('..')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  state: Joi.equal('failure', 'pending', 'success'),
}).required()

module.exports = class GithubCommitStatus extends GithubAuthV3Service {
  static category = 'build'
  static route = {
    base: 'github/commit-checks',
    pattern: ':user/:repo/:ref',
  }

  static examples = [
    {
      title: 'GitHub commit checks state',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        ref: 'master',
      },
      staticPreview: this.render({
        state: 'success',
      }),
      keywords: ['branch'],
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'checks' }

  static render({ state }) {
    if (state === "success") {
      return {
        message: `passing`,
        color: 'brightgreen',
      }
    } else if (state === "pending") {
      return {
        message: `pending`,
        color: 'yellow',
      }
    } else {
      return {
        message: `failing`,
        color: 'red',
      }
    }
  }

  async handle({ user, repo, ref }) {
    let state
    try {
      ;({ state } = await this._requestJson({
        url: `/repos/${user}/${repo}/commits/${ref}/status`,
        errorMessages: errorMessagesFor('ref not found'),
        schema,
      }))
    } catch (e) {
      if (e instanceof NotFound) {
        throw new InvalidParameter({ prettyMessage: 'invalid ref' })
      }
      throw e
    }

    return this.constructor.render({ state })
  }
}
