import Joi from 'joi'
import { NotFound, pathParams, queryParam } from '../index.js'
import { renderVersionBadge } from '../version.js'
import SnapcraftBase, { snapcraftPackageParam } from './snapcraft-base.js'

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

export default class SnapcraftVersion extends SnapcraftBase {
  static category = 'version'

  static route = {
    base: 'snapcraft/v',
    pattern: ':package/:track/:risk',
    queryParamSchema,
  }

  static openApi = {
    '/snapcraft/v/{package}/{track}/{risk}': {
      get: {
        summary: 'Snapcraft Version',
        parameters: [
          snapcraftPackageParam,
          ...pathParams(
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

  static defaultBadgeData = { label: 'snapcraft' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  static transform(apiData, track, risk, arch) {
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
    const parsedData = await this.fetch(versionSchema, { packageName })

    // filter results by track, risk and arch
    const { version } = this.constructor.transform(
      parsedData,
      track,
      risk,
      arch,
    )
    return this.constructor.render({ version })
  }
}
