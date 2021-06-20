import Joi from 'joi'
import { metric, addv, maybePluralize } from '../text-formatters.js'
import { downloadCount, version as versionColor } from '../color-formatters.js'
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

function DownloadsForInterval(interval) {
  const { base, messageSuffix, name } = {
    day: {
      base: 'hexpm/dd',
      messageSuffix: '/day',
      name: 'HexPmDownloadsDay',
    },
    week: {
      base: 'hexpm/dw',
      messageSuffix: '/week',
      name: 'HexPmDownloadsWeek',
    },
    all: {
      base: 'hexpm/dt',
      messageSuffix: '',
      name: 'HexPmDownloadsTotal',
    },
  }[interval]

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
        staticPreview: this.render({ downloads: 85000 }),
      },
    ]

    static defaultBadgeData = { label: 'downloads' }

    static render({ downloads }) {
      return {
        message: `${metric(downloads)}${messageSuffix}`,
        color: downloadCount(downloads),
      }
    }

    async handle({ packageName }) {
      const json = await this.fetch({ packageName })
      return this.constructor.render({ downloads: json.downloads[interval] })
    }
  }
}

const downloadsServices = ['day', 'week', 'all'].map(DownloadsForInterval)

export default [...downloadsServices, HexPmLicense, HexPmVersion]
