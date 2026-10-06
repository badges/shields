import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, NotFound, pathParams, queryParam } from '../index.js'

const schema = Joi.array()
  .items(
    Joi.object({
      finished_build: Joi.object({
        status: Joi.string().required(),
      }).allow(null),
    }),
  )
  .required()

const queryParamSchema = Joi.object({
  baseUrl: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
}).required()

const description = `
[Concourse](https://concourse-ci.org/) pipeline status. The badge is passing
only when every job that has finished a build succeeded. The pipeline must be
public. Point \`baseUrl\` at the Concourse web node, for example
\`https://ci.concourse-ci.org\`. The default team name is \`main\`.
`

export default class ConcoursePipeline extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'concourse/pipeline',
    pattern: ':team/:pipeline',
    queryParamSchema,
  }

  static openApi = {
    '/concourse/pipeline/{team}/{pipeline}': {
      get: {
        summary: 'Concourse Pipeline',
        description,
        parameters: [
          ...pathParams(
            { name: 'team', example: 'main' },
            { name: 'pipeline', example: 'concourse' },
          ),
          queryParam({
            name: 'baseUrl',
            example: 'https://ci.concourse-ci.org',
            required: true,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'build' }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async fetch({ baseUrl, team, pipeline }) {
    const root = baseUrl.replace(/\/+$/, '')
    return this._requestJson({
      schema,
      url: `${root}/api/v1/teams/${encodeURIComponent(team)}/pipelines/${encodeURIComponent(pipeline)}/jobs`,
      httpErrors: {
        401: 'private pipeline not supported',
        403: 'private pipeline not supported',
        404: 'pipeline not found',
      },
    })
  }

  static aggregate(jobs) {
    const statuses = jobs
      .map(job => job.finished_build && job.finished_build.status)
      .filter(Boolean)
    if (statuses.length === 0) {
      throw new NotFound({ prettyMessage: 'no builds' })
    }
    if (statuses.some(status => status === 'failed' || status === 'errored')) {
      return 'failed'
    }
    if (statuses.some(status => status === 'aborted')) {
      return 'aborted'
    }
    if (statuses.every(status => status === 'succeeded')) {
      return 'succeeded'
    }
    return statuses.find(status => status !== 'succeeded')
  }

  async handle({ team, pipeline }, { baseUrl }) {
    const jobs = await this.fetch({ baseUrl, team, pipeline })
    const status = this.constructor.aggregate(jobs)
    return this.constructor.render({ status })
  }
}
