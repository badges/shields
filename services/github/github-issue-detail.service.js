import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { formatDate, metric } from '../text-formatters.js'
import { age } from '../color-formatters.js'
import { InvalidResponse } from '../index.js'
import { GithubAuthV3Service } from './github-auth-service.js'
import {
  documentation,
  errorMessagesFor,
  issueStateColor,
  commentsColor,
} from './github-helpers.js'

const commonSchemaFields = {
  number: nonNegativeInteger,
  pull_request: Joi.any(),
}

const stateMap = {
  schema: Joi.object({
    ...commonSchemaFields,
    state: Joi.string().allow('open', 'closed').required(),
    merged_at: Joi.string().allow(null),
  }).required(),
  transform: ({ json }) => ({
    state: json.state,
    // Because eslint will not be happy with this snake_case name :(
    merged: json.merged_at !== null,
  }),
  render: ({ value, isPR, number }) => {
    const state = value.state
    const label = `${isPR ? 'pull request' : 'issue'} ${number}`

    if (!isPR || state === 'open') {
      return {
        color: issueStateColor(state),
        label,
        message: state,
      }
    } else if (value.merged) {
      return {
        label,
        message: 'merged',
        color: 'blueviolet',
      }
    } else
      return {
        label,
        message: 'rejected',
        color: 'red',
      }
  },
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
  transform: ({ json, property }) =>
    property === 'age' ? json.created_at : json.updated_at,
  render: ({ property, value }) => ({
    color: age(value),
    label: property === 'age' ? 'created' : 'updated',
    message: formatDate(value),
  }),
}

const propertyMap = {
  state: stateMap,
  title: titleMap,
  author: authorMap,
  label: labelMap,
  comments: commentsMap,
  age: ageUpdateMap,
  'last-update': ageUpdateMap,
}

export default class GithubIssueDetail extends GithubAuthV3Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github',
    pattern:
      ':issueKind(issues|pulls)/detail/:property(state|title|author|label|comments|age|last-update)/:user/:repo/:number([0-9]+)',
  }

  static examples = [
    {
      title: 'GitHub issue/pull request detail',
      namedParams: {
        issueKind: 'issues',
        property: 'state',
        user: 'badges',
        repo: 'shields',
        number: '979',
      },
      staticPreview: this.render({
        property: 'state',
        value: { state: 'closed' },
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

  static defaultBadgeData = {
    label: 'issue/pull request',
    color: 'informational',
  }

  static render({ property, value, isPR, number }) {
    return propertyMap[property].render({ property, value, isPR, number })
  }

  async fetch({ issueKind, property, user, repo, number }) {
    return this._requestJson({
      url: `/repos/${user}/${repo}/${issueKind}/${number}`,
      schema: propertyMap[property].schema,
      errorMessages: errorMessagesFor('issue, pull request or repo not found'),
    })
  }

  transform({ json, property, issueKind }) {
    const value = propertyMap[property].transform({ json, property })
    const isPR = 'pull_request' in json || issueKind === 'pulls'
    return { value, isPR }
  }

  async handle({ issueKind, property, user, repo, number }) {
    const json = await this.fetch({ issueKind, property, user, repo, number })
    const { value, isPR } = this.transform({ json, property, issueKind })
    return this.constructor.render({ property, value, isPR, number })
  }
}
