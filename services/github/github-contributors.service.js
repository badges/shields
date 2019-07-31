'use strict'

const Joi = require('@hapi/joi')
const parseLinkHeader = require('parse-link-header')
const { renderContributorBadge } = require('../contributor-count')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

// All we do is check its length.
const schema = Joi.array().items(Joi.object())

module.exports = class GithubContributors extends GithubAuthV3Service {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github',
      pattern: ':variant(contributors|contributors-anon)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub contributors',
        namedParams: {
          variant: 'contributors',
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: this.render({ contributorCount: 397 }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'contributors' }
  }

  static render({ contributorCount }) {
    return renderContributorBadge({ contributorCount })
  }

  async handle({ variant, user, repo }) {
    const isAnon = variant === 'contributors-anon'

    const { res, buffer } = await this._request({
      url: `/repos/${user}/${repo}/contributors`,
      options: { qs: { page: '1', per_page: '1', anon: isAnon } },
      errorMessages: errorMessagesFor('repo not found'),
    })

    const parsed = parseLinkHeader(res.headers['link'])
    let contributorCount
    if (parsed === null) {
      const json = this._parseJson(buffer)
      const contributorInfo = this.constructor._validate(json, schema)
      contributorCount = contributorInfo.length
    } else {
      contributorCount = +parsed.last.page
    }

    return this.constructor.render({ contributorCount })
  }
}
