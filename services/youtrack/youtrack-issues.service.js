import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl } from '../validators.js'
import { metric } from '../text-formatters.js'
import { description } from './youtrack-helper.js'
import YoutrackBase from './youtrack-base.js'

const schema = Joi.object({
  count: Joi.number().required(),
  $type: Joi.equal('IssueCountResponse'),
})

const queryParamSchema = Joi.object({
  query: Joi.string(),
  youtrack_url: optionalUrl,
}).required()

export default class YoutrackIssues extends YoutrackBase {
  static category = 'issue-tracking'

  static route = {
    base: 'youtrack/issues',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/youtrack/issues/{project}': {
      get: {
        summary: 'Youtrack Issues',
        description,
        parameters: [
          pathParam({
            name: 'project',
            example: 'RIDER',
          }),
          queryParam({
            name: 'youtrack_url',
            example: 'https://shields.youtrack.cloud',
            required: true,
          }),
          queryParam({
            name: 'query',
            example: 'bug #Unresolved',
            description: 'A valid YouTrack search query.',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'issues', color: 'informational' }

  static render({ count }) {
    return {
      label: 'issues',
      message: metric(count),
      color: count < 0 ? 'red' : count > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async fetch({ baseUrl, query }) {
    // https://www.jetbrains.com.cn/en-us/help/youtrack/devportal/resource-api-issuesGetter-count.html
    return super.fetch({
      schema,
      options: {
        method: 'POST',
        json: { query },
      },
      url: `${baseUrl}/api/issuesGetter/count?fields=count`,
    })
  }

  async handle(
    { project },
    { youtrack_url: baseUrl = 'https://youtrack.jetbrains.com', query },
  ) {
    const data = await this.fetch({
      baseUrl,
      query: `project: ${project} ${query}`,
    })

    return this.constructor.render({ count: data.count })
  }
}
