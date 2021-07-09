import camelcase from 'camelcase'
import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger, optionalUrl } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  topic_count: nonNegativeInteger,
  user_count: nonNegativeInteger,
  post_count: nonNegativeInteger,
  like_count: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl.required(),
}).required()

class DiscourseBase extends BaseJsonService {
  static category = 'chat'

  static buildRoute(metric) {
    return {
      base: 'discourse',
      pattern: metric,
      queryParamSchema,
    }
  }

  static defaultBadgeData = { label: 'discourse' }

  async fetch({ server }) {
    return this._requestJson({
      schema,
      url: `${server}/site/statistics.json`,
    })
  }
}

function DiscourseMetricIntegrationFactory({ metricName, property }) {
  return class DiscourseMetric extends DiscourseBase {
    // The space is needed so we get 'DiscourseTopics' rather than
    // 'Discoursetopics'. `camelcase()` removes it.
    static name = camelcase(`Discourse ${metricName}`, { pascalCase: true })
    static route = this.buildRoute(metricName)

    static examples = [
      {
        title: `Discourse ${metricName}`,
        namedParams: {},
        queryParams: {
          server: 'https://meta.discourse.org',
        },
        staticPreview: this.render({ stat: 100 }),
      },
    ]

    static render({ stat }) {
      return {
        message: `${metric(stat)} ${metricName}`,
        color: 'brightgreen',
      }
    }

    async handle(_routeParams, { server }) {
      const data = await this.fetch({ server })
      return this.constructor.render({ stat: data[property] })
    }
  }
}

class DiscourseStatus extends DiscourseBase {
  static route = this.buildRoute('status')
  static examples = [
    {
      title: `Discourse status`,
      namedParams: {},
      queryParams: {
        server: 'https://meta.discourse.org',
      },
      staticPreview: this.render(),
    },
  ]

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

const metricIntegrations = [
  { metricName: 'topics', property: 'topic_count' },
  { metricName: 'users', property: 'user_count' },
  { metricName: 'posts', property: 'post_count' },
  { metricName: 'likes', property: 'like_count' },
].map(DiscourseMetricIntegrationFactory)

export default [...metricIntegrations, DiscourseStatus]
