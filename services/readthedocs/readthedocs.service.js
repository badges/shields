import Joi from 'joi'
import { renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService, NotFound, pathParams } from '../index.js'

const schema = Joi.object({
  results: Joi.array()
    .items(
      Joi.object({
        state: Joi.object({
          code: Joi.string().required(),
        }).required(),
        success: Joi.boolean().required(),
      }),
    )
    .required(),
}).required()

const description =
  '[ReadTheDocs](https://readthedocs.com/) is a hosting service for documentation.'

export default class ReadTheDocs extends BaseJsonService {
  static category = 'build'

  static route = {
    base: 'readthedocs',
    pattern: ':project/:version?',
  }

  static auth = {
    passKey: 'readthedocs_token',
    authorizedOrigins: ['https://app.readthedocs.org'],
  }

  static openApi = {
    '/readthedocs/{packageName}': {
      get: {
        summary: 'Read the Docs',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'pip',
        }),
      },
    },
    '/readthedocs/{packageName}/{version}': {
      get: {
        summary: 'Read the Docs (version)',
        description,
        parameters: pathParams(
          {
            name: 'packageName',
            example: 'pip',
          },
          {
            name: 'version',
            example: 'stable',
          },
        ),
      },
    },
  }

  static _cacheLength = 300

  static defaultBadgeData = {
    label: 'docs',
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async fetch({ project, version = 'latest' }) {
    return this._requestJson(
      this.authHelper.withBearerAuthHeader(
        {
          schema,
          url: `https://app.readthedocs.org/api/v3/projects/${encodeURIComponent(project)}/versions/${encodeURIComponent(version)}/builds/`,
          options: {
            searchParams: {
              fields: 'state,success',
              limit: 10,
              running: false,
            },
          },
        },
        'Token',
      ),
    )
  }

  async handle({ project, version }) {
    const { results } = await this.fetch({ project, version })
    const build = results.find(({ state }) => state.code === 'finished')
    if (!build) {
      throw new NotFound({
        prettyMessage: 'no finished builds',
      })
    }
    return this.constructor.render({
      status: build.success ? 'passing' : 'failing',
    })
  }
}
