'use strict'

const gql = require('graphql-tag')
const Joi = require('joi')
const { downloadCount } = require('../color-formatters')
const { metric } = require('../text-formatters')
const { GithubAuthV4Service } = require('./github-auth-service')
const { documentation, transformErrors } = require('./github-helpers')

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      object: Joi.object({
        history: Joi.object({
          totalCount: Joi.number().required(),
        }).required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class GithubTotalCommits extends GithubAuthV4Service {
  static category = 'activity'

  static route = {
    base: 'github/total-commits',
    pattern: ':user/:repo/:branch*',
  }

  static examples = [
    {
      title: 'GitHub total commits',
      namedParams: {
        user: 'YashTotale',
        repo: 'terminal-all-in-one',
      },
      staticPreview: this.render({
        commits: 309,
      }),
      documentation,
    },
    {
      title: 'GitHub total commits (branch)',
      namedParams: {
        user: 'YashTotale',
        repo: 'YashTotale.github.io',
        branch: 'gh-pages',
      },
      staticPreview: this.render({
        commits: 140,
      }),
      documentation,
    },
  ]

  static defaultBadgeData = {
    label: 'commits',
  }

  static render({ commits }) {
    return {
      message: metric(commits),
      color: downloadCount(commits),
    }
  }

  async fetch({ user, repo, branch = 'HEAD' }) {
    return this._requestGraphql({
      query: gql`
        query($user: String!, $repo: String!, $branch: String!) {
          repository(owner: $user, name: $repo) {
            object(expression: $branch) {
              ... on Commit {
                history {
                  totalCount
                }
              }
            }
          }
        }
      `,
      variables: { user, repo, branch },
      schema,
      transformErrors,
    })
  }

  async handle({ user, repo, branch }) {
    const json = await this.fetch({ user, repo, branch })
    const commits = json.data.repository.object.history.totalCount
    return this.constructor.render({ commits })
  }
}
