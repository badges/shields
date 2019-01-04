'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const {
  metric,
  addv: versionText,
  maybePluralize,
} = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
  version: versionColor,
} = require('../../lib/color-formatters')

const hexSchema = Joi.object({
  downloads: Joi.object({
    // these keys may or may not exist
    all: Joi.number()
      .integer()
      .default(0),
    week: Joi.number()
      .integer()
      .default(0),
    day: Joi.number()
      .integer()
      .default(0),
  }).required(),
  meta: Joi.object({
    licenses: Joi.array().required(),
  }).required(),
  releases: Joi.array()
    .items(Joi.object({ version: Joi.string().required() }).required())
    .required(),
}).required()

class BaseHexPmService extends BaseJsonService {
  async fetch({ pkg }) {
    return this._requestJson({
      schema: hexSchema,
      url: `https://hex.pm/api/packages/${pkg}`,
    })
  }

  static get defaultBadgeData() {
    return { label: 'hex' }
  }
}

class HexPmLicense extends BaseHexPmService {
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

  async handle({ pkg }) {
    const json = await this.fetch({ pkg })
    return this.constructor.render({ licenses: json.meta.licenses })
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'hexpm/l',
      format: '(.+)',
      capture: ['pkg'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Hex.pm',
        pattern: ':package',
        exampleUrl: 'plug',
        staticExample: this.render({ licenses: ['Apache 2'] }),
      },
    ]
  }
}

class HexPmVersion extends BaseHexPmService {
  static render({ version }) {
    return { message: versionText(version), color: versionColor(version) }
  }

  async handle({ pkg }) {
    const json = await this.fetch({ pkg })
    return this.constructor.render({ version: json.releases[0].version })
  }

  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'hexpm/v',
      format: '(.+)',
      capture: ['pkg'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Hex.pm',
        pattern: ':package',
        exampleUrl: 'plug',
        staticExample: this.render({ version: '1.6.4' }),
      },
    ]
  }
}

function DownloadsForInterval(interval) {
  const { base, messageSuffix } = {
    day: {
      base: 'hexpm/dd',
      messageSuffix: '/day',
    },
    week: {
      base: 'hexpm/dw',
      messageSuffix: '/week',
    },
    all: {
      base: 'hexpm/dt',
      messageSuffix: '',
    },
  }[interval]

  return class HexPmDownloads extends BaseHexPmService {
    static render({ downloads }) {
      return {
        message: `${metric(downloads)}${messageSuffix}`,
        color: downloadCountColor(downloads),
      }
    }

    async handle({ pkg }) {
      const json = await this.fetch({ pkg })
      return this.constructor.render({ downloads: json.downloads[interval] })
    }

    static get defaultBadgeData() {
      return { label: 'downloads' }
    }

    static get category() {
      return 'downloads'
    }

    static get route() {
      return {
        base,
        format: '(.+)',
        capture: ['pkg'],
      }
    }

    static get examples() {
      return [
        {
          title: 'Hex.pm',
          pattern: ':package',
          exampleUrl: 'plug',
          staticExample: this.render({ downloads: 85000 }),
        },
      ]
    }
  }
}

const downloadsServices = ['day', 'week', 'all'].map(DownloadsForInterval)

module.exports = [...downloadsServices, HexPmLicense, HexPmVersion]
