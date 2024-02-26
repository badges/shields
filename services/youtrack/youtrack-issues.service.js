import Joi from 'joi'
import { pathParam, queryParam } from '../index.js'
import { optionalUrl } from '../validators.js'
import { metric } from '../text-formatters.js'
import { description } from './youtrack-helper.js'
import YoutrackBase from './youtrack-base.js'

const schema = Joi.array().items(
  Joi.object({
    count: Joi.number().required(),
    type: Joi.string().required(),
  }),
)

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
            example: 'https://youtrack.jetbrains.com',
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
      color: count > 0 ? 'yellow' : 'brightgreen',
    }
  }

  async fetch({ baseUrl, query }) {
    // https://www.jetbrains.com.cn/en-us/help/youtrack/devportal/resource-api-issuesGetter-count.html
    return super.fetch({
      schema,
      options: {
        method: 'POST',
        searchParams: {
          query,
        },
      },
      url: `${baseUrl}/api/issuesGetter/count?fields=count`,
    })
  }

  async handle(
    { project },
    { youtrack_url: baseUrl = 'https://youtrack.jetbrains.com', query },
  ) {
    const { res } = await this.fetch({
      baseUrl,
      query: `project: ${project} ${query}`,
    })

    console.log(res)

    const data = this.constructor._validate(res.headers, schema)

    const count = data.count()
    return this.constructor.render({ count })
  }
}
