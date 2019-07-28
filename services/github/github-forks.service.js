'use strict'

const gql = require('graphql-tag')
const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV4Service } = require('./github-auth-service')
const { documentation, transformErrors } = require('./github-helpers')

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      forks: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class GithubForks extends GithubAuthV4Service {
  static get category() {
    return 'social'
  }

  static get route() {
    return {
      base: 'github/forks',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub forks',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        // TODO: This is currently a literal, as `staticPreview` doesn't
        // support `link`.
        staticPreview: {
          label: 'Fork',
          message: '150',
          style: 'social',
        },
        // staticPreview: {
        //   ...this.render({ user: 'badges', repo: 'shields', forkCount: 150 }),
        //   label: 'fork',
        //   style: 'social',
        // },
        queryParams: { label: 'Fork' },
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'forks',
      namedLogo: 'github',
    }
  }

  static render({ user, repo, forkCount }) {
    return {
      message: metric(forkCount),
      color: '4183C4',
      link: [
        `https://github.com/${user}/${repo}/fork`,
        `https://github.com/${user}/${repo}/network`,
      ],
    }
  }

  async handle({ user, repo }) {
    const json = await this._requestGraphql({
      query: gql`
        query($user: String!, $repo: String!) {
          repository(owner: $user, name: $repo) {
            forks {
              totalCount
            }
          }
        }
      `,
      variables: { user, repo },
      schema,
      transformErrors,
    })
    return this.constructor.render({
      user,
      repo,
      forkCount: json.data.repository.forks.totalCount,
    })
  }
}
