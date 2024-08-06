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
    pattern: ':service(readthedocs|readthedocscom)/:project/:version?',
  }

  static examples = [
    {
      title: 'Read the Docs',
      pattern: ':service/:packageName',
      namedParams: { service: 'readthedocs', packageName: 'pip' },
      staticPreview: this.render({ status: 'passing' }),
      keywords,
    },
    {
      title: 'Read the Docs (version)',
      pattern: ':service/:packageName/:version',
      namedParams: { service: 'readthedocs', packageName: 'pip', version: 'stable' },
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

  async handle({ service, project, version }) {
    const baseUrl = service === 'readthedocs' ? 'readthedocs.org' : 'readthedocs.com'
    const options = { searchParams: { version } }

    // Add token for private repositories if needed
    if (service === 'readthedocscom' && this.authHelper) {
      const token = await this.authHelper.getToken({ url: `https://${baseUrl}` })
      if (token) {
        options.headers = {
          Authorization: `Token ${token}`
        }
      }
    }

    const { message: status } = await this._requestSvg({
      schema,
      url: `https://${baseUrl}/projects/${encodeURIComponent(project)}/badge/`,
      options,
    })

    if (status === 'unknown') {
      throw new NotFound({
        prettyMessage: 'project or version not found',
      })
    }
    return this.constructor.render({ status })
  }
}
