import Joi from 'joi'
import { pathParams } from '../index.js'
import { SnapstoreBase } from './snapstore-base.js'

const versionSchema = Joi.object({
  'channel-map': Joi.array().items(
    Joi.object({
      version: Joi.string().required(),
    }),
  ),
}).required()

export default class SnapstoreVersion extends SnapstoreBase {
  static category = 'version'

  static route = {
    base: 'snapstore/v',
    pattern: ':package',
  }

  static defaultBadgeData = { label: 'snapcraft', namedLogo: 'snapcraft' }

  static openApi = {
    '/snapstore/v/{package}': {
      get: {
        summary: 'Snapcraft version',
        parameters: pathParams({
          name: 'package',
          example: 'vim-editor',
        }),
      },
    },
  }

  static render({ version }) {
    return { message: version, color: 'blue', namedLogo: 'snapcraft' }
  }

  async handle({ package: packageName }) {
    const parsedData = await this.fetch({
      schema: versionSchema,
      options: {
        headers: { 'Snap-Device-Series': 16 },
      },
      url: `https://api.snapcraft.io/v2/snaps/info/${packageName}`,
    })

    const version = parsedData['channel-map'][0].version

    return this.constructor.render({ version })
  }
}
