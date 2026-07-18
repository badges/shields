import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, NotFound, pathParam, queryParam } from '../index.js'

// Buildbot result codes:
// https://docs.buildbot.net/latest/developer/results.html
// SUCCESS=0, WARNINGS=1, FAILURE=2, SKIPPED=3, EXCEPTION=4, RETRY=5, CANCELLED=6
const resultMap = {
  0: 'passing',
  1: 'unstable',
  2: 'failing',
  3: 'skipped',
  4: 'failing',
  5: 'building',
  6: 'cancelled',
}

const schema = Joi.object({
  builds: Joi.array()
    .items(
      Joi.object({
        complete: Joi.boolean().required(),
        results: Joi.number()
          .integer()
          .valid(...Object.keys(resultMap).map(Number))
          .allow(null),
      }),
    )
    .required(),
}).required()

const queryParamSchema = Joi.object({
  baseUrl: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
}).required()

const description = `
Shows the build status of the most recent build for a
[Buildbot](https://buildbot.net/) builder.

Each Buildbot installation has its own URL (for example
\`https://buildbot.mariadb.org\`).
`

export default class Buildbot extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'buildbot/build',
    pattern: ':builder',
    queryParamSchema,
  }

  static openApi = {
    '/buildbot/build/{builder}': {
      get: {
        summary: 'Buildbot',
        description,
        parameters: [
          pathParam({
            name: 'builder',
            example: 'amd64-rhel8-dockerlibrary',
          }),
          queryParam({
            name: 'baseUrl',
            example: 'https://buildbot.mariadb.org',
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

  async fetch({ baseUrl, builder }) {
    return this._requestJson({
      schema,
      url: `${baseUrl}/api/v2/builders/${encodeURIComponent(builder)}/builds`,
      options: {
        searchParams: { limit: '1', order: '-number' },
      },
      httpErrors: {
        404: 'builder not found',
      },
    })
  }

  transform({ builds }) {
    if (builds.length === 0) {
      throw new NotFound({ prettyMessage: 'no builds found' })
    }

    const { complete, results } = builds[0]
    if (!complete) {
      return { status: 'building' }
    }

    return { status: resultMap[results] ?? 'unknown' }
  }

  async handle({ builder }, { baseUrl }) {
    const json = await this.fetch({ baseUrl, builder })
    const { status } = this.transform({ builds: json.builds })
    return this.constructor.render({ status })
  }
}
