import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound } from '../index.js'

const queryParamSchema = Joi.object({
  repositoryUrl: optionalUrl.required(),
  sort: Joi.string().valid('defined', 'semver').default('defined'),
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
    {
      title: 'VPM Package Version (latest semver)',
      namedParams: {
        packageId: 'com.vrchat.udonsharp',
      },
      queryParams: {
        repositoryUrl: 'https://packages.vrchat.com/curated?download',
        sort: 'semver',
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

  async handle({ packageId }, { repositoryUrl, sort }) {
    const data = await this.fetch({ repositoryUrl })
    const pkg = data.packages[packageId]
    if (pkg === undefined)
      throw new NotFound({ prettyMessage: 'package not found' })
    const versions = Object.keys(pkg.versions)
    let version
    if (sort === 'defined') {
      version = versions.reverse()[0]
    } else if (sort === 'semver') {
      version = latest(versions)
    }

    return renderVersionBadge({ version })
  }
}
