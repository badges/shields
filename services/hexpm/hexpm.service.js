'use strict'

const Joi = require('@hapi/joi')
const { metric, addv, maybePluralize } = require('../text-formatters')
const { downloadCount, version: versionColor } = require('../color-formatters')
const { BaseJsonService } = require('..')

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
  releases: Joi.array()
    .items(Joi.object({ version: Joi.string().required() }).required())
    .required(),
}).required()

class BaseHexPmService extends BaseJsonService {
  static get defaultBadgeData() {
    // arbitrary comment
    return { label: 'hex' }
  }

  async fetch({ packageName }) {
    return this._requestJson({
      schema: hexSchema,
      url: `https://hex.pm/api/packages/${packageName}`,
    })
  }
}

class HexPmLicense extends BaseHexPmService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'hexpm/l',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Hex.pm',
        namedParams: { packageName: 'plug' },
        staticPreview: this.render({ licenses: ['Apache 2'] }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

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
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'hexpm/v',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Hex.pm',
        namedParams: { packageName: 'plug' },
        staticPreview: this.render({ version: '1.6.4' }),
      },
    ]
  }

  static render({ version }) {
    return { message: addv(version), color: versionColor(version) }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ version: json.releases[0].version })
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
    static get name() {
      return name
    }

    static get category() {
      return 'downloads'
    }

    static get route() {
      return {
        base,
        pattern: ':packageName',
      }
    }

    static get examples() {
      return [
        {
          title: 'Hex.pm',
          namedParams: { packageName: 'plug' },
          staticPreview: this.render({ downloads: 85000 }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: 'downloads' }
    }

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

module.exports = [...downloadsServices, HexPmLicense, HexPmVersion]
