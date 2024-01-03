import Joi from 'joi'
import { latest, renderVersionBadge } from '../version.js'
import {
  BaseJsonService,
  NotFound,
  InvalidResponse,
  pathParams,
} from '../index.js'

const schema = Joi.array()
  .items(
    Joi.object().pattern(
      /./,
      Joi.object()
        .pattern(/./, Joi.object().pattern(/./, Joi.object()))
        .required(),
    ), // Optional, missing means not found
  )
  .max(1)
  .required()

const defaultDistribution = 'stable'

export default class Debian extends BaseJsonService {
  static category = 'version'
  static route = {
    base: 'debian/v',
    pattern: ':packageName/:distribution?',
  }

  static openApi = {
    '/debian/v/{packageName}/{distribution}': {
      get: {
        summary: 'Debian package (for distribution)',
        parameters: pathParams(
          {
            name: 'packageName',
            example: 'apt',
          },
          {
            name: 'distribution',
            example: 'unstable',
          },
        ),
      },
    },
    '/debian/v/{packageName}': {
      get: {
        summary: 'Debian package',
        parameters: pathParams({
          name: 'packageName',
          example: 'apt',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'debian' }

  async handle({ packageName, distribution = defaultDistribution }) {
    const data = await this._requestJson({
      schema,
      url: 'https://api.ftp-master.debian.org/madison',
      options: {
        searchParams: {
          f: 'json',
          s: distribution,
          package: packageName,
        },
      },
    })
    if (!data.length) {
      throw new NotFound()
    }
    // Distribution can change compared to request, for example requesting
    // "stretch" may map to "stable" in results, so can't use value from
    // request as is. Just take the first one instead.
    const packageData = data[0][packageName]
    if (!packageData) {
      throw new InvalidResponse({ prettyMessage: 'invalid response data' })
    }
    const distKeys = Object.keys(packageData)
    if (!distKeys) {
      throw new NotFound()
    }
    const versions = Object.keys(packageData[distKeys[0]])
    return renderVersionBadge({ version: latest(versions) })
  }
}
