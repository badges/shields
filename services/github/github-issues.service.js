'use strict'

const Joi = require('joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { GithubAuthService } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const isWhichPR = {
  'issues-pr': true,
  'issues-pr-closed': true,
}

const isWhichClosed = {
  'issues-closed': true,
  'issues-pr-closed': true,
}

const schema = Joi.object({
  total_count: nonNegativeInteger,
}).required()

module.exports = class GithubIssues extends GithubAuthService {
  static get category() {
    return 'issue-tracking'
  }

  static get defaultBadgeData() {
    return {
      label: 'issues',
      color: 'informational',
    }
  }

  static get route() {
    return {
      base: 'github',
      pattern:
        ':which(issues|issues-closed|issues-pr|issues-pr-closed):raw(-raw)?/:user/:repo/:label*',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub issues',
        pattern: 'issues/:user/:repo',
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
        title: 'GitHub issues',
        pattern: 'issues-raw/:user/:repo',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'open issues',
          message: '167',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub issues by-label',
        pattern: 'issues/:user/:repo/:label',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          label: 'service-badge',
        },
        staticPreview: {
          label: 'service-badge issues',
          message: '110 open',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub issues by-label',
        pattern: 'issues-raw/:user/:repo/:label',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          label: 'service-badge',
        },
        staticPreview: {
          label: 'open service-badge issues',
          message: '110',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub closed issues',
        pattern: 'issues-closed/:user/:repo',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'issues',
          message: '899 closed',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub closed issues',
        pattern: 'issues-closed-raw/:user/:repo',
        namedParams: {
          user: 'badges',
          repo: 'shields',
        },
        staticPreview: {
          label: 'closed issues',
          message: '899',
          color: 'yellow',
        },
        documentation,
      },
      {
        title: 'GitHub pull requests',
        pattern: 'issues-pr/:user/:repo',
        namedParams: {
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: {
          label: 'pull requests',
          message: '136 open',
          color: 'yellow',
        },
        keywords: ['pullrequest', 'pr'],
        documentation,
      },
      {
        title: 'GitHub pull requests',
        pattern: 'issues-pr-raw/:user/:repo',
        namedParams: {
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: {
          label: 'open pull requests',
          message: '136',
          color: 'yellow',
        },
        keywords: ['pullrequest', 'pr'],
        documentation,
      },
      {
        title: 'GitHub closed pull requests',
        pattern: 'issues-pr-closed/:user/:repo',
        namedParams: {
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: {
          label: 'pull requests',
          message: '7k closed',
          color: 'yellow',
        },
        keywords: ['pullrequest', 'pr'],
        documentation,
      },
      {
        title: 'GitHub closed pull requests',
        pattern: 'issues-pr-closed-raw/:user/:repo',
        namedParams: {
          user: 'cdnjs',
          repo: 'cdnjs',
        },
        staticPreview: {
          label: 'closed pull requests',
          message: '7k',
          color: 'yellow',
        },
        keywords: ['pullrequest', 'pr'],
        documentation,
      },
      {
        title: 'GitHub pull requests by-label',
        pattern: 'issues-pr/:user/:repo/:label',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          label: 'service-badge',
        },
        staticPreview: {
          label: 'service-badge pull requests',
          message: '8 open',
          color: 'yellow',
        },
        keywords: ['pullrequests', 'pr'],
        documentation,
      },
      {
        title: 'GitHub pull requests by-label',
        pattern: 'issues-pr-raw/:user/:repo/:label',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          label: 'service-badge',
        },
        staticPreview: {
          label: 'open service-badge pull requests',
          message: '8',
          color: 'yellow',
        },
        keywords: ['pullrequests', 'pr'],
        documentation,
      },
    ]
  }

  static render({ which, numIssues, raw, label }) {
    const state = isWhichClosed[which] ? 'closed' : 'open'

    let labelPrefix = ''
    let messageSuffix = ''
    if (raw) {
      labelPrefix = `${state} `
    } else {
      messageSuffix = state
    }

    const isGhLabelMultiWord = label && label.includes(' ')
    const labelText = label
      ? `${isGhLabelMultiWord ? `"${label}"` : label} `
      : ''
    const labelSuffix = isWhichPR[which] ? 'pull requests' : 'issues'

    return {
      label: `${labelPrefix}${labelText}${labelSuffix}`,
      message: `${metric(numIssues)} ${messageSuffix}`,
      color: numIssues > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async fetch({ which, user, repo, label }) {
    const isPR = isWhichPR[which]
    const isClosed = isWhichClosed[which]
    const query = `repo:${user}/${repo}${isPR ? ' is:pr' : ' is:issue'}${
      isClosed ? ' is:closed' : ' is:open'
    }${label ? ` label:"${label}"` : ''}`
    const options = { qs: { q: query } }
    return this._requestJson({
      url: `/search/issues`,
      options,
      schema,
      errorMessages: errorMessagesFor('repo not found'),
    })
  }

  async handle({ which, raw, user, repo, label }) {
    const json = await this.fetch({ which, user, repo, label })
    return this.constructor.render({
      which,
      numIssues: json.total_count,
      raw,
      label,
    })
  }
}
