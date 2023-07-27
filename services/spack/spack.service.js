import Joi from 'joi'
import { renderVersionBadge } from '..//version.js'
import { BaseJsonService } from '../index.js'
const schema = Joi.object({
  latest_version: Joi.string().required(),
}).required()

export default class SpackVersion extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'spack/v',
    pattern: ':packageName',
  }

  static examples = [
    {
      title: 'Spack',
      namedParams: { packageName: 'adios2' },
      staticPreview: this.render({ version: '2.8.0' }),
      keywords: ['hpc'],
    },
  ]

  static defaultBadgeData = { label: 'spack' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://packages.spack.io/data/packages/${packageName}.json`,
      httpErrors: {
        404: 'package not found',
      },
    })
  }

  async handle({ packageName }) {
    const pkg = await this.fetch({ packageName })
    return this.constructor.render({ version: pkg.latest_version })
  }
}
