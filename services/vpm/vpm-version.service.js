import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound } from '../index.js'

const queryParamSchema = Joi.object({
  repositoryUrl: optionalUrl.required(),
}).required()

const schema = Joi.object({
  packages: Joi.object()
    .pattern(
      /./,
      Joi.object({
        versions: Joi.object().pattern(/./, Joi.object()).required(),
      }).required()
    )
    .required(),
}).required()

export default class VpmVersion extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'vpm/v',
    pattern: ':packageId',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'VPM Package Version',
      namedParams: {
        packageId: 'com.vrchat.udonsharp',
      },
      queryParams: {
        repositoryUrl: 'https://packages.vrchat.com/curated?download',
      },
      staticPreview: renderVersionBadge({ version: '1.1.6' }),
    },
  ]

  static defaultBadgeData = {
    label: 'vpm',
  }

  async fetch({ repositoryUrl }) {
    return this._requestJson({
      schema,
      url: repositoryUrl,
    })
  }

  async handle({ packageId }, { repositoryUrl }) {
    const data = await this.fetch({ repositoryUrl })
    const pkg = data.packages[packageId]
    if (pkg === undefined)
      throw new NotFound({ prettyMessage: 'package not found' })
    const versions = Object.keys(pkg.versions)
    const version = latest(versions)

    return renderVersionBadge({ version })
  }
}
