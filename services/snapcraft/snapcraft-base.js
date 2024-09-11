import config from 'config'
import { BaseJsonService, pathParam } from '../index.js'

export const snapcraftPackageParam = pathParam({
  name: 'package',
  example: 'Redis',
})

export const snapcraftBaseParams = [snapcraftPackageParam]

export default class SnapcraftBase extends BaseJsonService {
  async fetch(schema, { packageName }) {
    const snapcraftBaseUrl =
      config.util.toObject().public.services.snapcraft.baseUri
    return await this._requestJson({
      schema,
      url: `${snapcraftBaseUrl}/${packageName}`,
      options: {
        headers: { 'Snap-Device-Series': 16 },
      },
      httpErrors: { 404: 'package not found' },
    })
  }
}
