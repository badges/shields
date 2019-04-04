'use strict'

const Joi = require('joi')
const { InvalidResponse } = require('..')
const { nonNegativeInteger } = require('../validators')
const { formatDate, metric } = require('../text-formatters')
const { age } = require('../color-formatters')
const { GithubAuthService } = require('./github-auth-service')
const {
  documentation,
  errorMessagesFor,
  stateColor,
  commentsColor,
} = require('./github-helpers')

const commonSchemaFields = {
  number: nonNegativeInteger,
  pull_request: Joi.any(),
}

const stateMap = {
  schema: Joi.object({
    ...commonSchemaFields,
    state: Joi.string()
      .allow('open', 'closed')
      .required(),
  }).required(),
  transform: ({ json }) => json.state,
  render: ({ value, isPR, number }) => ({
    color: stateColor(value),
    label: `${isPR ? 'pull request' : 'issue'} ${number}`,
    message: value,
  }),
}

const titleMap = {
  schema: Joi.object({
    ...commonSchemaFields,
    title: Joi.string().required(),
  }).required(),
  transform: ({ json }) => json.title,
  render: ({ value, isPR, number }) => ({
    label: `${isPR ? 'pull request' : 'issue'} ${number}`,
    message: value,
  }),
}

const authorMap = {
  schema: Joi.object({
    ...commonSchemaFields,
    user: Joi.object({
      login: Joi.string().required(),
    }).required(),
  }).required(),
  transform: ({ json }) => json.user.login,
  render: ({ value }) => ({
    label: 'author',
    message: value,
  }),
}

const labelMap = {
  schema: Joi.object({
    ...commonSchemaFields,
    labels: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          color: Joi.string().required(),
        })
      )
      .required(),
  }).required(),
  transform: ({ json }) => {
    if (json.labels.length === 0) {
      throw new InvalidResponse({ prettyMessage: 'no labels found' })
    }
    return {
      names: json.labels.map(l => l.name),
      colors: json.labels.map(l => l.color),
    }
  },
  render: ({ value }) => {
    let color
    if (value.colors.length === 1) {
      color = value.colors[0]
    }
    return {
      color,
      label: 'label',
      message: value.names.join(' | '),
    }
  },
}

const commentsMap = {
  schema: Joi.object({
    ...commonSchemaFields,
    comments: nonNegativeInteger,
  }).required(),
  transform: ({ json }) => json.comments,
  render: ({ value }) => ({
    color: commentsColor(value),
    label: 'comments',
    message: metric(value),
  }),
}

const ageUpdateMap = {
  schema: Joi.object({
    ...commonSchemaFields,
    created_at: Joi.date().required(),
    updated_at: Joi.date().required(),
  }).required(),
  transform: ({ json, which }) =>
    which === 'age' ? json.created_at : json.updated_at,
  render: ({ which, value }) => ({
    color: age(value),
    label: which === 'age' ? 'created' : 'updated',
    message: formatDate(value),
  }),
}

const whichMap = {
  state: stateMap,
  title: titleMap,
  author: authorMap,
  label: labelMap,
  comments: commentsMap,
  age: ageUpdateMap,
  'last-update': ageUpdateMap,
}

module.exports = class GithubIssueDetail extends GithubAuthService {
  static get category() {
    return 'issue-tracking'
  }

  static get route() {
    return {
      base: 'github/issues/detail',
      pattern:
        ':which(state|title|author|label|comments|age|last-update)/:user/:repo/:number([0-9]+)',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub issue/pull request detail',
        namedParams: {
          which: 'state',
          user: 'badges',
          repo: 'shields',
          number: '979',
        },
        staticPreview: this.render({
          which: 'state',
          value: 'closed',
          isPR: false,
          number: '979',
        }),
        keywords: [
          'state',
          'title',
          'author',
          'label',
          'comments',
          'age',
          'last update',
        ],
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'issue/pull request',
      color: 'informational',
    }
  }

  static render({ which, value, isPR, number }) {
    return whichMap[which].render({ which, value, isPR, number })
  }

  async fetch({ which, user, repo, number }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/issues/${number}`,
      schema: whichMap[which].schema,
      errorMessages: errorMessagesFor('issue, pull request or repo not found'),
    })
  }

  transform({ json, which }) {
    const value = whichMap[which].transform({ json, which })
    const isPR = json.hasOwnProperty('pull_request')
    return { value, isPR }
  }

  async handle({ which, user, repo, number }) {
    const json = await this.fetch({ which, user, repo, number })
    const { value, isPR } = this.transform({ json, which })
    return this.constructor.render({ which, value, isPR, number })
  }
}
