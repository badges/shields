import Joi from 'joi'
import { pathParams, queryParam, NotFound } from '../index.js'
import { renderDateBadge } from '../date.js'
import SnapcraftBase, { snapcraftPackageParam } from './snapcraft-base.js'

const queryParamSchema = Joi.object({
  arch: Joi.string(),
})

const lastUpdateSchema = Joi.object({
  'channel-map': Joi.array()
    .items(
      Joi.object({
        channel: Joi.object({
          architecture: Joi.string().required(),
          risk: Joi.string().required(),
          track: Joi.string().required(),
          'released-at': Joi.string().required(),
        }),
      }).required(),
    )
    .min(1)
    .required(),
}).required()

export default class SnapcraftLastUpdate extends SnapcraftBase {
  static category = 'activity'

  static route = {
    base: 'snapcraft/last-update',
    pattern: ':package/:track/:risk',
    queryParamSchema,
  }

  static openApi = {
    '/snapcraft/last-update/{package}/{track}/{risk}': {
      get: {
        summary: 'Snapcraft Last Update',
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
              'Architecture, when not specified, this will default to `amd64`.',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'last updated' }

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
    const parsedData = await this.fetch(lastUpdateSchema, { packageName })

    // filter results by track, risk and arch
    const { channel } = this.constructor.transform(
      parsedData,
      track,
      risk,
      arch,
    )

    return renderDateBadge(channel['released-at'])
  }
}
