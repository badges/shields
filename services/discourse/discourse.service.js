import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger, url } from '../validators.js'
import { BaseJsonService, queryParams } from '../index.js'

const schemaSingular = Joi.object({
  topic_count: nonNegativeInteger,
  user_count: nonNegativeInteger,
  post_count: nonNegativeInteger,
  like_count: nonNegativeInteger,
}).required()

const schemaPlural = Joi.object({
  topics_count: nonNegativeInteger,
  users_count: nonNegativeInteger,
  posts_count: nonNegativeInteger,
  likes_count: nonNegativeInteger,
})

const schema = Joi.alternatives(schemaSingular, schemaPlural)

const queryParamSchema = Joi.object({
  server: url,
}).required()

function singular(variant) {
  return variant.slice(0, -1)
}

const params = queryParams({
  name: 'server',
  example: 'https://meta.discourse.org',
  required: true,
})

class DiscourseBase extends BaseJsonService {
  static category = 'chat'

  static defaultBadgeData = { label: 'discourse' }

  async fetch({ server }) {
    return this._requestJson({
      schema,
      url: `${server}/site/statistics.json`,
    })
  }
}

class DiscourseMetric extends DiscourseBase {
  static route = {
    base: 'discourse',
    pattern: ':variant(topics|users|posts|likes)',
    queryParamSchema,
  }

  static openApi = {
    '/discourse/topics': {
      get: { summary: 'Discourse Topics', parameters: params },
    },
    '/discourse/users': {
      get: { summary: 'Discourse Users', parameters: params },
    },
    '/discourse/posts': {
      get: { summary: 'Discourse Posts', parameters: params },
    },
    '/discourse/likes': {
      get: { summary: 'Discourse Likes', parameters: params },
    },
  }

  static render({ variant, stat }) {
    return {
      message: `${metric(stat)} ${variant}`,
      color: 'brightgreen',
    }
  }

  async handle({ variant }, { server }) {
    const data = await this.fetch({ server })
    // e.g. variant == 'topics' --> try 'topic_count' then 'topics_count'
    let stat = data[`${singular(variant)}_count`]
    if (stat === undefined) {
      stat = data[`${variant}_count`]
    }
    return this.constructor.render({ variant, stat })
  }
}

class DiscourseStatus extends DiscourseBase {
  static route = {
    base: 'discourse',
    pattern: 'status',
    queryParamSchema,
  }

  static openApi = {
    '/discourse/status': {
      get: {
        summary: 'Discourse Status',
        parameters: params,
      },
    },
  }

  static render() {
    return {
      message: 'online',
      color: 'brightgreen',
    }
  }

  async handle(_routeParams, { server }) {
    await this.fetch({ server })
    // if fetch() worked, the server is up
    // if it failed, we'll show an error e.g: 'inaccessible'
    return this.constructor.render()
  }
}

export default [DiscourseMetric, DiscourseStatus]
