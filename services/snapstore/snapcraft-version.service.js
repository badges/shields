import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'

const versionSchema = Joi.object({
  'channel-map': Joi.array()
    .items(
      Joi.object({
        version: Joi.string().required(),
      }).required(),
    )
    .min(1)
    .required(),
}).required()

export default class SnapcraftVersion extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'snapcraft/v',
    pattern: ':package',
  }

  static defaultBadgeData = { label: 'snapcraft' }

  static openApi = {
    '/snapcraft/v/{package}': {
      get: {
        summary: 'Snapcraft version',
        parameters: pathParams({
          name: 'package',
          example: 'vim-editor',
        }),
      },
    },
  }

  async handle({ package: packageName }) {
    const parsedData = await this._requestJson({
      schema: versionSchema,
      options: {
        headers: { 'Snap-Device-Series': 16 },
      },
      url: `https://api.snapcraft.io/v2/snaps/info/${packageName}`,
      httpErrors: {
        404: 'package not found',
      },
    })

    const version = parsedData['channel-map'][0].version

    return renderVersionBadge({ version })
  }
}
