import { BaseJsonService, pathParam } from '../index.js'

export const snapcraftPackageParam = pathParam({
  name: 'package',
  example: 'redis',
})

export const snapcraftBaseParams = [snapcraftPackageParam]

const snapcraftBaseUrl = 'https://api.snapcraft.io/v2/snaps/info'

export default class SnapcraftBase extends BaseJsonService {
  async fetch(schema, { packageName }) {
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
