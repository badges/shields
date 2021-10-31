import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { addv, maybePluralize } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import { BaseJsonService } from '../index.js'

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
  latest_stable_version: Joi.string().required(),
}).required()

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

  static examples = [
    {
      title: 'Hex.pm',
      namedParams: { packageName: 'plug' },
      staticPreview: this.render({ licenses: ['Apache 2'] }),
    },
  ]

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

  static examples = [
    {
      title: 'Hex.pm',
      namedParams: { packageName: 'plug' },
      staticPreview: this.render({ version: '1.6.4' }),
    },
  ]

  static render({ version }) {
    return { message: addv(version), color: versionColor(version) }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ version: json.latest_stable_version })
  }
}

function DownloadsForInterval(downloadInterval) {
  const { base, interval, name } = {
    day: {
      base: 'hexpm/dd',
      interval: 'day',
      name: 'HexPmDownloadsDay',
    },
    week: {
      base: 'hexpm/dw',
      interval: 'week',
      name: 'HexPmDownloadsWeek',
    },
    all: {
      base: 'hexpm/dt',
      name: 'HexPmDownloadsTotal',
    },
  }[downloadInterval]

  return class HexPmDownloads extends BaseHexPmService {
    static name = name

    static category = 'downloads'

    static route = {
      base,
      pattern: ':packageName',
    }

    static examples = [
      {
        title: 'Hex.pm',
        namedParams: { packageName: 'plug' },
        staticPreview: renderDownloadsBadge({ downloads: 85000 }),
      },
    ]

    static defaultBadgeData = { label: 'downloads' }

    async handle({ packageName }) {
      const json = await this.fetch({ packageName })
      const downloads = json.downloads[downloadInterval]
      return renderDownloadsBadge({ downloads, interval })
    }
  }
}

const downloadsServices = ['day', 'week', 'all'].map(DownloadsForInterval)

export default [...downloadsServices, HexPmLicense, HexPmVersion]
