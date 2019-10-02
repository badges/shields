'use strict'

const gql = require('graphql-tag')
const Joi = require('@hapi/joi')
const moment = require('moment')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthV4Service } = require('./github-auth-service')
const {
  documentation: githubDocumentation,
  transformErrors,
} = require('./github-helpers')

const documentation = `
  <p>
    This badge is designed for projects hosted on GitHub which are
    participating in
    <a href="https://hacktoberfest.digitalocean.com">Hacktoberfest</a>,
    an initiative to encourage participating in open-source projects. The
    badge can be added to the project readme to encourage potential
    contributors to review the suggested issues and to celebrate the
    contributions that have already been made.

    The badge displays three pieces of information:
    <ul>
      <li>
        The number of suggested issues. By default this will count open
        issues with the <strong>hacktoberfest</strong> label, however you
        can pick a different label (e.g.
        <code>?suggestion_label=good%20first%20issue</code>).
      </li>
      <li>
        The number of pull requests opened in October. This excludes any
        PR with the <strong>invalid</strong> label.
      </li>
      <li>The number of days left of October.</li>
    </ul>

  </p>

  ${githubDocumentation}
`

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
      base: 'github/hacktoberfest/2019',
      pattern: ':user/:repo',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub Hacktoberfest combined status',
        namedParams: {
          user: 'snyk',
          repo: 'snyk',
        },
        staticPreview: this.render({
          suggestedIssueCount: 12,
          contributionCount: 8,
          daysLeft: 15,
        }),
        documentation,
      },
      {
        title:
          'GitHub Hacktoberfest combined status (suggestion label override)',
        namedParams: {
          user: 'tmrowco',
          repo: 'tmrowapp-contrib',
        },
        queryParams: {
          suggestion_label: 'help wanted',
        },
        staticPreview: this.render({
          suggestedIssueCount: 12,
          contributionCount: 8,
          daysLeft: 15,
        }),
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

  static render({ suggestedIssueCount, contributionCount, daysLeft }) {
    if (daysLeft === undefined) {
      daysLeft = moment('2019-11-01').diff(moment(), 'days')
    }

    const message =
      [
        suggestedIssueCount ? `${metric(suggestedIssueCount)} open issues` : '',
        contributionCount ? `${metric(contributionCount)} PRs` : '',
        daysLeft > 0 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` : '',
      ]
        .filter(Boolean)
        .join(', ') || 'is done!'

    return { message }
  }

  async fetch({ user, repo, suggestionLabel = 'hacktoberfest' }) {
    const isValidOctoberPR = [
      `repo:${user}/${repo}`,
      'is:pr',
      'created:2019-10-01..2019-10-31',
      `-label:invalid`,
    ]
      .filter(Boolean)
      .join(' ')
    const {
      data: {
        repository: {
          issues: { totalCount: suggestedIssueCount },
        },
        search: { issueCount: contributionCount },
      },
    } = await this._requestGraphql({
      query: gql`
        query(
          $user: String!
          $repo: String!
          $suggestionLabel: String!
          $isValidOctoberPR: String!
        ) {
          repository(owner: $user, name: $repo) {
            issues(states: [OPEN], labels: [$suggestionLabel]) {
              totalCount
            }
          }
          search(query: $isValidOctoberPR, type: ISSUE, last: 0) {
            issueCount
          }
        }
      `,
      variables: {
        user,
        repo,
        suggestionLabel,
        isValidOctoberPR,
      },
      schema,
      transformErrors,
    })
    return {
      suggestedIssueCount,
      contributionCount,
    }
  }

  async handle({ user, repo }, { suggestion_label: suggestionLabel }) {
    const { suggestedIssueCount, contributionCount } = await this.fetch({
      user,
      repo,
      suggestionLabel,
    })
    return this.constructor.render({
      suggestedIssueCount,
      contributionCount,
    })
  }
}
