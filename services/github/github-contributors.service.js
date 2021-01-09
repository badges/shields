'use strict'

const Joi = require('joi')
const parseLinkHeader = require('parse-link-header')
const { renderContributorBadgeWithLink } = require('../contributor-count')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

// All we do is check its length.
const schema = Joi.array().items(Joi.object())

module.exports = class GithubContributors extends GithubAuthV3Service {
  static category = 'activity'
  static route = {
    base: 'github',
    pattern: ':variant(contributors|contributors-anon)/:user/:repo',
  }

  static examples = [
    {
      title: 'GitHub contributors',
      namedParams: {
        variant: 'contributors',
        user: 'cdnjs',
        repo: 'cdnjs',
      },
      // TODO: This is currently a literal, as `staticPreview` doesn't
      // support `link`.
      staticPreview: {
        label: 'contributors',
        message: '397',
        color: 'brightgreen',
      },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'contributors' }

  static render({ user, repo, contributorCount }) {
    const slug = `${encodeURIComponent(user)}/${encodeURIComponent(repo)}`
    const link = [
      `https://github.com/${slug}`,
      `https://github.com/${slug}/graphs/contributors`,
    ]
    return renderContributorBadgeWithLink({ contributorCount, link })
  }

  async handle({ variant, user, repo }) {
    const isAnon = variant === 'contributors-anon'

    const { res, buffer } = await this._request({
      url: `/repos/${user}/${repo}/contributors`,
      options: { qs: { page: '1', per_page: '1', anon: isAnon } },
      errorMessages: errorMessagesFor('repo not found'),
    })

    const parsed = parseLinkHeader(res.headers.link)
    let contributorCount
    if (parsed === null) {
      const json = this._parseJson(buffer)
      const contributorInfo = this.constructor._validate(json, schema)
      contributorCount = contributorInfo.length
    } else {
      contributorCount = +parsed.last.page
    }

    return this.constructor.render({ user, repo, contributorCount })
  }
}
