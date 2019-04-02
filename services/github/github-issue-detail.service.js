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

const stateSchema = Joi.object({
  ...commonSchemaFields,
  state: Joi.string()
    .allow('open', 'closed')
    .required(),
}).required()

const stateMap = {
  schema: stateSchema,
  getLabel: getDefaultLabel,
  getColor: ({ value }) => stateColor(value),
  transform: ({ json }) => json.state,
}

const titleSchema = Joi.object({
  ...commonSchemaFields,
  title: Joi.string().required(),
}).required()

const titleMap = {
  schema: titleSchema,
  getLabel: getDefaultLabel,
  transform: ({ json }) => json.title,
}

const authorSchema = Joi.object({
  ...commonSchemaFields,
  user: Joi.object({
    login: Joi.string().required(),
  }).required(),
}).required()

const authorMap = {
  schema: authorSchema,
  getLabel: () => 'author',
  transform: ({ json }) => json.user.login,
}

const labelSchema = Joi.object({
  ...commonSchemaFields,
  labels: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        color: Joi.string().required(),
      })
    )
    .required(),
}).required()

const labelMap = {
  schema: labelSchema,
  getColor: ({ json }) => {
    if (json.labels.length === 1) {
      return json.labels[0].color
    }
  },
  getLabel: () => 'label',
  transform: ({ json }) => {
    if (json.labels.length === 0) {
      throw new InvalidResponse({ prettyMessage: 'no labels found' })
    }
    return json.labels.map(l => l.name).join(' | ')
  },
}

const commentsSchema = Joi.object({
  ...commonSchemaFields,
  comments: nonNegativeInteger,
}).required()

const commentsMap = {
  schema: commentsSchema,
  getColor: ({ value }) => commentsColor(value),
  getLabel: () => 'comments',
  transform: ({ json }) => json.comments,
}

const ageUpdateSchema = Joi.object({
  ...commonSchemaFields,
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
}).required()

const ageUpdateMap = {
  schema: ageUpdateSchema,
  formatMessage: date => formatDate(date),
  getColor: ({ value }) => age(value),
  getLabel: ({ which }) => (which === 'age' ? 'created' : 'updated'),
  transform: ({ json, which }) =>
    which === 'age' ? json.created_at : json.updated_at,
}

const whichMap = {
  s: stateMap,
  state: stateMap,
  title: titleMap,
  u: authorMap,
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
        ':which(s|state|title|u|author|label|comments|age|last-update)/:user/:repo/:number',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub issue/pull request detail',
        pattern:
          ':which(state|title|author|label|comments|age|last-update)/:user/:repo/:number',
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
    let color
    if (whichMap[which].getColor) {
      color = whichMap[which].getColor({ value, json })
    }

    let message = value
    if (whichMap[which].formatMessage) {
      message = whichMap[which].formatMessage({ value })
    }

    return {
      label: whichMap[which].getLabel({ which, json }),
      message,
      color,
    }
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
