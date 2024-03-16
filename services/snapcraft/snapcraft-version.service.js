import Joi from 'joi'
import { BaseJsonService, NotFound, pathParams, queryParam } from '../index.js'
import { renderVersionBadge } from '../version.js'

const queryParamSchema = Joi.object({
  arch: Joi.string(),
})

const versionSchema = Joi.object({
  'channel-map': Joi.array()
    .items(
      Joi.object({
        channel: Joi.object({
          architecture: Joi.string().required(),
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
    queryParamSchema,
  }

  static defaultBadgeData = { label: 'snapcraft' }

  static openApi = {
    '/snapcraft/v/{package}/{track}/{risk}': {
      get: {
        summary: 'Snapcraft version',
        parameters: [
          ...pathParams(
            { name: 'package', example: 'chromium' },
            { name: 'track', example: 'latest' },
            { name: 'risk', example: 'stable' },
          ),
          queryParam({
            name: 'arch',
            example: 'amd64',
            description:
              'Architecture, When not specified, this will default to `amd64`.',
          }),
        ],
      },
    },
  }

  transform(apiData, track, risk, arch) {
    const channelMap = apiData['channel-map']
    let filteredChannelMap = channelMap.filter(
      ({ channel }) => channel.architecture === arch,
    )
    if (filteredChannelMap.length === 0) {
      throw new NotFound({ prettyMessage: 'arch not found' })
    }
    filteredChannelMap = filteredChannelMap.filter(
      ({ channel }) => channel.track === track,
    )
    if (filteredChannelMap.length === 0) {
      throw new NotFound({ prettyMessage: 'track not found' })
    }
    filteredChannelMap = filteredChannelMap.filter(
      ({ channel }) => channel.risk === risk,
    )
    if (filteredChannelMap.length === 0) {
      throw new NotFound({ prettyMessage: 'risk not found' })
    }

    return filteredChannelMap[0]
  }

  async handle({ package: packageName, track, risk }, { arch = 'amd64' }) {
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

    // filter results by track, risk and arch
    const { version } = this.transform(parsedData, track, risk, arch)

    return renderVersionBadge({ version })
  }
}
