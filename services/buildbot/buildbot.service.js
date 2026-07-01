import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, NotFound, pathParam, queryParam } from '../index.js'

const resultStatusMap = {
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
        results: Joi.number().integer().min(0).max(6),
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
Shows the build status of the most recent build for a Buildbot builder.

Each Buildbot installation has its own URL (for example \`https://buildbot.mariadb.org\`).

The Buildbot REST API does not document or enforce request rate limits; any
throttling is left to the operator (for example via a reverse proxy in front of
the instance). See the [Buildbot REST API documentation](https://docs.buildbot.net/latest/developer/rest.html).
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
    if (status === 'unstable') {
      return {
        message: status,
        color: 'yellow',
      }
    }

    return renderBuildStatusBadge({ status })
  }

  buildsUrl({ baseUrl, builder }) {
    const trimmedBaseUrl = baseUrl.replace(/\/$/, '')
    return `${trimmedBaseUrl}/api/v2/builders/${encodeURIComponent(builder)}/builds`
  }

  async fetch({ baseUrl, builder }) {
    return this._requestJson({
      schema,
      url: this.buildsUrl({ baseUrl, builder }),
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

    return { status: resultStatusMap[results] ?? 'unknown' }
  }

  async handle({ builder }, { baseUrl }) {
    const json = await this.fetch({ baseUrl, builder })
    const { status } = this.transform({ builds: json.builds })
    return this.constructor.render({ status })
  }
}
