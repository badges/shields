import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService, NotFound, pathParams } from '../index.js'

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

const description =
  '[ReadTheDocs](https://readthedocs.com/) is a hosting service for documentation.'

export default class ReadTheDocs extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'readthedocs',
    pattern: ':project/:version?',
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

  static defaultBadgeData = {
    label: 'docs',
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle({ project, version }) {
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://readthedocs.org/projects/${encodeURIComponent(
        project,
      )}/badge/`,
      options: { searchParams: { version } },
    })
    if (status === 'unknown') {
      throw new NotFound({
        prettyMessage: 'project or version not found',
      })
    }
    return this.constructor.render({ status })
  }
}
