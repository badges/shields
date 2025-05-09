import Joi from 'joi'
import { url } from '../validators.js'
import { latest, renderVersionBadge } from '../version.js'
import { BaseJsonService, NotFound, pathParam, queryParam } from '../index.js'

const queryParamSchema = Joi.object({
  repository_url: url,
  include_prereleases: Joi.equal(''),
}).required()

const schema = Joi.object({
  packages: Joi.object()
    .pattern(
      /./,
      Joi.object({
        versions: Joi.object().pattern(/./, Joi.object()).min(1).required(),
      }).required(),
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

  static openApi = {
    '/vpm/v/{packageId}': {
      get: {
        summary: 'VPM Package Version',
        description: 'VPM is the VRChat Package Manager',
        parameters: [
          pathParam({
            name: 'packageId',
            example: 'com.vrchat.udonsharp',
          }),
          queryParam({
            name: 'repository_url',
            example: 'https://packages.vrchat.com/curated?download',
            required: true,
          }),
          queryParam({
            name: 'include_prereleases',
            schema: { type: 'boolean' },
            example: null,
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'vpm',
  }

  async fetch({ repositoryUrl }) {
    return this._requestJson({
      schema,
      url: repositoryUrl,
    })
  }

  async handle(
    { packageId },
    { repository_url: repositoryUrl, include_prereleases: prereleases },
  ) {
    const data = await this.fetch({ repositoryUrl })
    const pkg = data.packages[packageId]
    if (pkg === undefined)
      throw new NotFound({ prettyMessage: 'package not found' })
    const versions = Object.keys(pkg.versions)
    const version = latest(versions, { pre: prereleases !== undefined })

    return renderVersionBadge({ version })
  }
}
