import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { maybePluralize } from '../text-formatters.js'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const hexSchema = Joi.object({
  downloads: Joi.object({
    // these keys may or may not exist
    all: Joi.number().integer().default(0),
    week: Joi.number().integer().default(0),
    day: Joi.number().integer().default(0),
  }).required(),
  meta: Joi.object({
    licenses: Joi.array().required(),
  }).required(),
  latest_stable_version: Joi.string().allow(null),
  latest_version: Joi.string().required(),
}).required()

const description = '[Hex.pm](https://hex.pm/) is a package registry for Erlang'

class BaseHexPmService extends BaseJsonService {
  static defaultBadgeData = { label: 'hex' }

  async fetch({ packageName }) {
    return this._requestJson({
      schema: hexSchema,
      url: `https://hex.pm/api/packages/${packageName}`,
    })
  }
}

class HexPmLicense extends BaseHexPmService {
  static category = 'license'

  static route = {
    base: 'hexpm/l',
    pattern: ':packageName',
  }

  static openApi = {
    '/hexpm/l/{packageName}': {
      get: {
        summary: 'Hex.pm License',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'plug',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

  static render({ licenses }) {
    if (licenses.length === 0) {
      return {
        label: 'license',
        message: 'Unknown',
        color: 'lightgrey',
      }
    }
    return {
      label: maybePluralize('license', licenses),
      message: licenses.join(', '),
      color: 'blue',
    }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ licenses: json.meta.licenses })
  }
}

class HexPmVersion extends BaseHexPmService {
  static category = 'version'

  static route = {
    base: 'hexpm/v',
    pattern: ':packageName',
  }

  static openApi = {
    '/hexpm/v/{packageName}': {
      get: {
        summary: 'Hex.pm Version',
        description,
        parameters: pathParams({
          name: 'packageName',
          example: 'plug',
        }),
      },
    },
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({
      version: json.latest_stable_version || json.latest_version,
    })
  }
}

const periodMap = {
  dd: {
    field: 'day',
    label: 'day',
  },
  dw: {
    field: 'week',
    label: 'week',
  },
  dt: {
    field: 'all',
  },
}

class HexPmDownloads extends BaseHexPmService {
  static category = 'downloads'

  static route = {
    base: 'hexpm',
    pattern: ':interval(dd|dw|dt)/:packageName',
  }

  static openApi = {
    '/hexpm/{interval}/{packageName}': {
      get: {
        summary: 'Hex.pm Downloads',
        description,
        parameters: pathParams(
          {
            name: 'interval',
            example: 'dw',
            schema: { type: 'string', enum: this.getEnum('interval') },
            description: 'Daily, Weekly, or Total downloads',
          },
          {
            name: 'packageName',
            example: 'plug',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'downloads' }

  async handle({ interval, packageName }) {
    const json = await this.fetch({ packageName })
    const downloads = json.downloads[periodMap[interval].field]
    return renderDownloadsBadge({
      downloads,
      interval: periodMap[interval].label,
    })
  }
}

export default [HexPmDownloads, HexPmLicense, HexPmVersion]
