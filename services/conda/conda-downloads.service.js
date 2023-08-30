import { pathParams } from '../index.js'
import { renderDownloadsBadge } from '../downloads.js'
import BaseCondaService from './conda-base.js'

export default class CondaDownloads extends BaseCondaService {
  static category = 'downloads'
  static route = { base: 'conda', pattern: ':variant(d|dn)/:channel/:pkg' }

  static openApi = {
    '/conda/{variant}/{channel}/{package}': {
      get: {
        summary: 'Conda Downloads',
        parameters: pathParams(
          {
            name: 'variant',
            example: 'dn',
            schema: { type: 'string', enum: this.getEnum('variant') },
          },
          {
            name: 'channel',
            example: 'conda-forge',
          },
          {
            name: 'package',
            example: 'python',
          },
        ),
      },
    },
  }

  static render({ variant, downloads }) {
    const labelOverride = variant === 'dn' ? 'downloads' : 'conda|downloads'
    return renderDownloadsBadge({ downloads, labelOverride })
  }

  async handle({ variant, channel, pkg }) {
    const json = await this.fetch({ channel, pkg })
    const downloads = json.files.reduce(
      (total, file) => total + file.ndownloads,
      0,
    )
    return this.constructor.render({ variant, downloads })
  }
}
