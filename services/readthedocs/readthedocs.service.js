import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseSvgScrapingService, NotFound } from '../index.js'

const keywords = ['documentation']

const schema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

export default class ReadTheDocs extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'readthedocs',
    pattern: ':project/:version?',
  }

  static examples = [
    {
      title: 'Read the Docs',
      pattern: ':packageName',
      namedParams: { packageName: 'pip' },
      staticPreview: this.render({ status: 'passing' }),
      keywords,
    },
    {
      title: 'Read the Docs (version)',
      pattern: ':packageName/:version',
      namedParams: { packageName: 'pip', version: 'stable' },
      staticPreview: this.render({ status: 'passing' }),
      keywords,
    },
  ]

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
        project
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
