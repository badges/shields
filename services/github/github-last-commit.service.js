'use strict'

const Joi = require('joi')
const { formatDate } = require('../text-formatters')
const { age: ageColor } = require('../color-formatters')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')
const commonExampleAttrs = {
  keywords: ['latest'],
  documentation,
}

const schema = Joi.array()
  .items(
    Joi.object({
      commit: Joi.object({
        author: Joi.object({
          date: Joi.string().required(),
        }).required(),
      }).required(),
    }).required()
  )
  .required()

module.exports = class GithubLastCommit extends GithubAuthV3Service {
  static category = 'activity'
  static route = { base: 'github/last-commit', pattern: ':user/:repo/:branch*' }
  static examples = [
    {
      title: 'GitHub last commit',
      pattern: ':user/:repo',
      namedParams: {
        user: 'google',
        repo: 'skia',
      },
      staticPreview: {
        message: formatDate('2013-07-31T20:01:41Z'),
        color: 'red',
      },
      ...commonExampleAttrs,
    },
    {
      title: 'GitHub last commit (branch)',
      pattern: ':user/:repo/:branch',
      namedParams: {
        user: 'google',
        repo: 'skia',
        branch: 'infra/config',
      },
      staticPreview: {
        message: formatDate('2013-07-31T20:01:41Z'),
        color: 'red',
      },
      ...commonExampleAttrs,
    },
  ]

  static defaultBadgeData = { label: 'last commit' }

  static render({ user, repo, branch, commitDate }) {
    const slug = `${encodeURIComponent(user)}/${encodeURIComponent(repo)}`
    return {
      message: formatDate(commitDate),
      color: ageColor(Date.parse(commitDate)),
      link: [
        `https://github.com/${slug}`,
        `https://github.com/${slug}/commits/${branch}`,
      ],
    }
  }

  async fetch({ user, repo, branch }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/commits`,
      options: { qs: { sha: branch } },
      schema,
      errorMessages: errorMessagesFor(),
    })
  }

  async handle({ user, repo, branch }) {
    const body = await this.fetch({ user, repo, branch })
    return this.constructor.render({ commitDate: body[0].commit.author.date })
  }
}
