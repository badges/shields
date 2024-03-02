import Joi from 'joi'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'

const versionSchema = Joi.object({
  'channel-map': Joi.array()
    .items(
      Joi.object({
        channel: Joi.object({
          risk: Joi.string().required(),
          track: Joi.string().required(),
        }),
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
    pattern: ':package/:track/:risk',
  }

  static defaultBadgeData = { label: 'snapcraft' }

  static openApi = {
    '/snapcraft/v/{package}/{track}/{risk}': {
      get: {
        summary: 'Snapcraft version',
        parameters: pathParams(
          { name: 'package', example: 'chromium' },
          { name: 'track', example: 'latest' },
          { name: 'risk', example: 'stable' },
        ),
      },
    },
  }

  async handle({ package: packageName, track, risk }) {
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

    const channelMap = parsedData['channel-map']
    let filteredChannelMap = channelMap.filter(
      ({ channel }) => channel.track === track,
    )
    if (filteredChannelMap.length === 0) {
      throw new NotFound({ prettyMessage: 'track not found' })
    }
    filteredChannelMap = channelMap.filter(
      ({ channel }) => channel.risk === risk,
    )
    if (filteredChannelMap.length === 0) {
      throw new NotFound({ prettyMessage: 'risk not found' })
    }

    return renderVersionBadge({ version: filteredChannelMap[0].version })
  }
}
