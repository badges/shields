'use strict'

const gql = require('graphql-tag')
const Joi = require('@hapi/joi')
const moment = require('moment')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV4Service } = require('./github-auth-service')
const { documentation, transformErrors } = require('./github-helpers')

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      issues: Joi.object({
        totalCount: nonNegativeInteger,
      }).required(),
    }).required(),
    search: Joi.object({
      issueCount: nonNegativeInteger,
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  suggestion_label: Joi.string(),
}).required()

module.exports = class GithubHacktoberfestCombinedStatus extends GithubAuthV4Service {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'github/hacktoberfest/combined',
      pattern: ':user/:repo',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Hacktoberfest combined status',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'issues',
          message: '167 open',
          color: 'yellow',
        },
        documentation,
      },
      {
        title:
          'GitHub Hacktoberfest combined status (suggestion label override)',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        queryParams: {
          suggestion_label: 'good first issue',
        },
        staticPreview: {
          label: 'open issues',
          message: '167',
          color: 'yellow',
        },
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'hacktoberfest',
      color: 'orange',
    }
  }

  static render({ suggestedIssueCount, mergedContributionCount }) {
    const daysLeft = moment('2019-11-01').diff(moment(), 'days')

    const message =
      [
        suggestedIssueCount ? `${metric(suggestedIssueCount)} suggestions` : '',
        mergedContributionCount
          ? `${metric(mergedContributionCount)} merged`
          : '',
        daysLeft > 0 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` : '',
      ]
        .filter(Boolean)
        .join(', ') || 'is done!'

    return { message }
  }

  async fetch({ user, repo, suggestionLabel = 'hacktoberfest' }) {
    const isMergedHacktoberfestPR = [
      `repo:${user}/${repo}`,
      'tag:hacktoberfest',
      'is:pr',
      'is:merged',
      'created:>2019-10-01',
    ].join(' ')
    const {
      data: {
        repository: {
          issues: { totalCount: suggestedIssueCount },
        },
        search: { issueCount: mergedContributionCount },
      },
    } = await this._requestGraphql({
      query: gql`
        query(
          $user: String!
          $repo: String!
          $suggestionLabel: String!
          $isMergedHacktoberfestPR: String!
        ) {
          repository(owner: $user, name: $repo) {
            issues(states: [OPEN], labels: [$suggestionLabel]) {
              totalCount
            }
          }
          search(query: $isMergedHacktoberfestPR, type: ISSUE, last: 0) {
            issueCount
          }
        }
      `,
      variables: {
        user,
        repo,
        suggestionLabel,
        isMergedHacktoberfestPR,
      },
      schema,
      transformErrors,
    })
    return {
      suggestedIssueCount,
      mergedContributionCount,
    }
  }

  async handle({ user, repo }, { suggestion_label: suggestionLabel }) {
    const { suggestedIssueCount, mergedContributionCount } = await this.fetch({
      user,
      repo,
      suggestionLabel,
    })
    return this.constructor.render({
      suggestedIssueCount,
      mergedContributionCount,
    })
  }
}
