'use strict'

const { default: gql } = require('graphql-tag')
const Joi = require('joi')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV4Service } = require('./github-auth-service')
const { transformErrors } = require('./github-helpers')

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      discussions: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class GithubTotalDiscussions extends GithubAuthV4Service {
  static category = 'other'
  static route = {
    base: 'github/discussions',
    pattern: ':user/:repo',
  }

  static examples = [
    {
      title: 'GitHub Discussions',
      namedParams: {
        user: 'vercel',
        repo: 'next.js',
      },
      staticPreview: this.render({
        discussions: '6000 total',
      }),
    },
  ]

  static defaultBadgeData = { label: 'discussions', color: 'blue' }

  static render({ discussions }) {
    return { message: discussions }
  }

  async fetch({ user, repo }) {
    return this._requestGraphql({
      query: gql`
        query ($user: String!, $repo: String!) {
          repository(name: $repo, owner: $user) {
            discussions {
              totalCount
            }
          }
        }
      `,
      variables: { user, repo },
      schema,
      options: { headers: { 'GraphQL-Features': 'discussions_api' } },
      transformErrors,
    })
  }

  async handle({ user, repo }) {
    const json = await this.fetch({ user, repo })
    const {
      data: {
        repository: {
          discussions: { totalCount },
        },
      },
    } = json
    return this.constructor.render({ discussions: `${totalCount} total` })
  }
}
