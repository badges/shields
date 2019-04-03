'use strict'

const Joi = require('joi')
const { InvalidResponse } = require('..')
const { nonNegativeInteger } = require('../validators')
const { formatDate } = require('../text-formatters')
const { age } = require('../color-formatters')
const { GithubAuthService } = require('./github-auth-service')
const {
  documentation,
  errorMessagesFor,
  stateColor,
  commentsColor,
} = require('./github-helpers')

const getDefaultLabel = ({ json }) => {
  if (json.pull_request) {
    return `pull request ${json.number}`
  }

  return `issue ${json.number}`
}

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
  render: ({ value, json }) => ({
    color: stateColor(value),
    label: getDefaultLabel({ json }),
    message: value,
  }),
}

const titleMap = {
  schema: Joi.object({
    ...commonSchemaFields,
    title: Joi.string().required(),
  }).required(),
  transform: ({ json }) => json.title,
  render: ({ value, json }) => ({
    label: getDefaultLabel({ json }),
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
    return json.labels.map(l => l.name).join(' | ')
  },
  render: ({ value, json }) => {
    let color
    if (json.labels.length === 1) {
      color = json.labels[0].color
    }
    return {
      color,
      label: 'label',
      message: value,
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
    message: value,
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
        ':which(state|title|author|label|comments|age|last-update)/:user/:repo/:number',
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
        staticPreview: {
          label: 'issue 979',
          message: 'closed',
          color: 'red',
        },
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

  static render({ which, value, json }) {
    return whichMap[which].render({ which, value, json })
  }

  async fetch({ which, user, repo, number }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/issues/${number}`,
      schema: whichMap[which].schema,
      errorMessages: errorMessagesFor('issue, pull request or repo not found'),
    })
  }

  transform({ json, which }) {
    return { value: whichMap[which].transform({ json, which }) }
  }

  async handle({ which, user, repo, number }) {
    const json = await this.fetch({ which, user, repo, number })
    const { value } = this.transform({ json, which })
    return this.constructor.render({ which, value, json })
  }
}
