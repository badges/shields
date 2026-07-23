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
    pattern: ':domain(org|com)?/:project/:version?',
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
    '/readthedocs/{domain}/{packageName}': {
      get: {
        summary: 'Read the Docs (domain)',
        description,
        parameters: pathParams(
          {
            name: 'domain',
            example: 'org',
          },
          {
            name: 'packageName',
            example: 'pip',
          },
        ),
      },
    },
    '/readthedocs/{domain}/{packageName}/{version}': {
      get: {
        summary: 'Read the Docs (version)',
        description,
        parameters: pathParams(
          {
            name: 'domain',
            example: 'org',
          },
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

  async handle({ domain = 'org', project, version }) {
    const { message: status } = await this._requestSvg({
      schema,
      url: `https://readthedocs.${domain}/projects/${encodeURIComponent(
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
