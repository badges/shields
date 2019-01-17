'use strict'

const Joi = require('joi')
const parseLinkHeader = require('parse-link-header')
const { GithubAuthService } = require('./github-auth-service')
const { renderContributorBadge } = require('../../lib/contributor-count')
const { documentation, errorMessagesFor } = require('./github-helpers')

// All we do is check its length.
const schema = Joi.array().items(Joi.object())

module.exports = class GithubContributors extends GithubAuthService {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'github',
      pattern: ':which(contributors|contributors-anon)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub contributors',
        namedParams: {
          which: 'contributors',
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

  async handle({ which, user, repo }) {
    const isAnon = which === 'contributors-anon'

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
