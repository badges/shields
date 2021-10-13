import gql from 'graphql-tag'
import Joi from 'joi'
import moment from 'moment'
import { metric, maybePluralize } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import {
  documentation as githubDocumentation,
  transformErrors,
} from './github-helpers.js'

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

export default class GithubHacktoberfestCombinedStatus extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github/hacktoberfest',
    pattern: ':year(2019|2020|2021)/:user/:repo',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitHub Hacktoberfest combined status',
      namedParams: {
        year: '2021',
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
      title: 'GitHub Hacktoberfest combined status (suggestion label override)',
      namedParams: {
        year: '2021',
        user: 'tmrowco',
        repo: 'tmrowapp-contrib',
      },
      queryParams: {
        suggestion_label: 'help wanted',
      },
      staticPreview: this.render({
        year: '2021',
        suggestedIssueCount: 12,
        contributionCount: 8,
        daysLeft: 15,
      }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'hacktoberfest', color: 'orange' }

  static render({
    suggestedIssueCount,
    contributionCount,
    daysLeft,
    daysToStart,
    year,
    hasStarted = true,
  }) {
    if (!hasStarted) {
      return {
        message: `${daysToStart} ${maybePluralize(
          'day',
          daysToStart
        )} till kickoff!`,
      }
    }
    if (daysLeft === undefined) {
      // The global cutoff time is 11/1 noon UTC.
      // https://github.com/badges/shields/pull/4109#discussion_r330782093
      // We want to show "1 day left" on the last day so we add 1.
      daysLeft = moment(`${year}-11-01 12:00:00 Z`).diff(moment(), 'days') + 1
    }
    if (daysLeft < 0) {
      return {
        message: `is over! (${metric(contributionCount)} ${maybePluralize(
          'PR',
          contributionCount
        )} opened)`,
      }
    }
    const message =
      [
        suggestedIssueCount
          ? `${metric(suggestedIssueCount)} ${maybePluralize(
              'open issue',
              suggestedIssueCount
            )}`
          : '',
        contributionCount
          ? `${metric(contributionCount)} ${maybePluralize(
              'PR',
              contributionCount
            )}`
          : '',
        daysLeft > 0
          ? `${daysLeft} ${maybePluralize('day', daysLeft)} left`
          : '',
      ]
        .filter(Boolean)
        .join(', ') || 'is over!'

    return { message }
  }

  async fetch({ user, repo, year, suggestionLabel = 'hacktoberfest' }) {
    const isValidOctoberPR = [
      `repo:${user}/${repo}`,
      'is:pr',
      `created:${year}-10-01..${year}-10-31`,
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
        query (
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

  static getCalendarPosition(year) {
    const daysToStart = moment(`${year}-10-01 00:00:00 Z`).diff(
      moment(),
      'days'
    )
    const isBefore = daysToStart > 0
    return { daysToStart, isBefore }
  }

  async handle({ user, repo, year }, { suggestion_label: suggestionLabel }) {
    const { isBefore, daysToStart } = this.constructor.getCalendarPosition(
      +year
    )
    if (isBefore) {
      return this.constructor.render({ hasStarted: false, daysToStart, year })
    }

    const { suggestedIssueCount, contributionCount } = await this.fetch({
      user,
      repo,
      year,
      suggestionLabel,
    })
    return this.constructor.render({
      suggestedIssueCount,
      contributionCount,
      year,
    })
  }
}
