'use strict'

const gql = require('graphql-tag')
const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV4Service } = require('./github-auth-service')
const { documentation, transformErrors } = require('./github-helpers')

const issueCountSchema = Joi.object({
  data: Joi.object({
    search: Joi.object({
      issueCount: nonNegativeInteger,
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  query: Joi.string().required(),
}).required()

class BaseGithubIssuesSearch extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static defaultBadgeData = { label: 'query', color: 'informational' }

  static render({ issueCount }) {
    return { message: metric(issueCount) }
  }

  async fetch({ query }) {
    const data = await this._requestGraphql({
      query: gql`
        query($query: String!) {
          search(query: $query, type: ISSUE) {
            issueCount
          }
        }
      `,
      variables: { query },
      schema: issueCountSchema,
      transformErrors,
    })
    return data.data.search.issueCount
  }
}

class GithubIssuesSearch extends BaseGithubIssuesSearch {
  static route = {
    base: 'github',
    pattern: 'issues-search',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub issue custom search',
      namedParams: {},
      queryParams: {
        query: 'repo:badges/shields is:closed label:bug author:app/sentry-io',
      },
      staticPreview: {
        label: 'query',
        message: '10',
        color: 'blue',
      },
      documentation,
    },
  ]

  async handle(namedParams, { query }) {
    const issueCount = await this.fetch({ query })
    return this.constructor.render({ issueCount })
  }
}

class GithubRepoIssuesSearch extends BaseGithubIssuesSearch {
  static route = {
    base: 'github',
    pattern: 'issues-search/:user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub issue custom search in repo',
      namedParams: {
        user: 'badges',
        repo: 'shields',
      },
      queryParams: {
        query: 'is:closed label:bug author:app/sentry-io',
      },
      staticPreview: {
        label: 'query',
        message: '10',
        color: 'blue',
      },
      documentation,
    },
  ]

  async handle({ user, repo }, { query }) {
    query = `repo:${user}/${repo} ${query}`
    const issueCount = await this.fetch({ query })
    return this.constructor.render({ issueCount })
  }
}

module.exports = {
  GithubIssuesSearch,
  GithubRepoIssuesSearch,
}
