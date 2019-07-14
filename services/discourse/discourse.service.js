'use strict'

const camelcase = require('camelcase')
const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  topic_count: nonNegativeInteger,
  user_count: nonNegativeInteger,
  post_count: nonNegativeInteger,
  like_count: nonNegativeInteger,
}).required()

class DiscourseBase extends BaseJsonService {
  static get category() {
    return 'chat'
  }

  static buildRoute(metric) {
    return {
      base: 'discourse',
      // Do not base new services on this route pattern.
      // See https://github.com/badges/shields/issues/3714
      pattern: `:scheme(http|https)/:host/${metric}`,
    }
  }

  static get defaultBadgeData() {
    return { label: 'discourse' }
  }

  async fetch({ scheme, host }) {
    return this._requestJson({
      schema,
      url: `${scheme}://${host}/site/statistics.json`,
    })
  }
}

function DiscourseMetricIntegrationFactory({ metricName, property }) {
  return class DiscourseMetric extends DiscourseBase {
    static get name() {
      // The space is needed so we get 'DiscourseTopics' rather than
      // 'Discoursetopics'. `camelcase()` removes it.
      return camelcase(`Discourse ${metricName}`, { pascalCase: true })
    }

    static get route() {
      return this.buildRoute(metricName)
    }

    static get examples() {
      return [
        {
          title: `Discourse ${metricName}`,
          namedParams: {
            scheme: 'https',
            host: 'meta.discourse.org',
          },
          staticPreview: this.render({ stat: 100 }),
        },
      ]
    }

    static render({ stat }) {
      return {
        message: `${metric(stat)} ${metricName}`,
        color: 'brightgreen',
      }
    }

    async handle({ scheme, host }) {
      const data = await this.fetch({ scheme, host })
      return this.constructor.render({ stat: data[property] })
    }
  }
}

class DiscourseStatus extends DiscourseBase {
  static get route() {
    return this.buildRoute('status')
  }

  static get examples() {
    return [
      {
        title: `Discourse status`,
        namedParams: {
          scheme: 'https',
          host: 'meta.discourse.org',
        },
        staticPreview: this.render(),
      },
    ]
  }

  static render() {
    return {
      message: 'online',
      color: 'brightgreen',
    }
  }

  async handle({ scheme, host }) {
    await this.fetch({ scheme, host })
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

module.exports = [...metricIntegrations, DiscourseStatus]
