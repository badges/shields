import Joi from 'joi'
import { renderDateBadge } from '../date.js'
import { floorCount as floorCountColor } from '../color-formatters.js'
import { renderLicenseBadge } from '../licenses.js'
import { metric } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import {
  BaseJsonService,
  NotFound,
  InvalidResponse,
  pathParams,
} from '../index.js'
import { renderVersionBadge } from '../version.js'

const aurSchema = Joi.object({
  resultcount: nonNegativeInteger,
  results: Joi.array()
    .items(
      Joi.object({
        License: Joi.array().items(Joi.string().required()).allow(null),
        NumVotes: nonNegativeInteger,
        Popularity: Joi.number().precision(2).min(0).required(),
        Version: Joi.string().required(),
        OutOfDate: nonNegativeInteger.allow(null),
        Maintainer: Joi.string().required().allow(null),
        LastModified: nonNegativeInteger,
      }),
    )
    .required(),
}).required()

class BaseAurService extends BaseJsonService {
  static defaultBadgeData = { label: 'aur' }

  static _validate(data, schema) {
    if (data.resultcount === 0) {
      // Note the 'not found' response from Arch Linux is:
      // status code = 200,
      // body = {"version":1,"type":"info","resultcount":0,"results":[]}
      throw new NotFound({ prettyMessage: 'package not found' })
    }
    return super._validate(data, schema)
  }

  async fetch({ packageName }) {
    // Please refer to the Arch wiki page for the full spec and documentation:
    // https://wiki.archlinux.org/index.php/Aurweb_RPC_interface
    return this._requestJson({
      schema: aurSchema,
      url: 'https://aur.archlinux.org/rpc',
      options: { searchParams: { v: 5, type: 'info', arg: packageName } },
    })
  }
}

class AurLicense extends BaseAurService {
  static category = 'license'
  static route = { base: 'aur/license', pattern: ':packageName' }

  static openApi = {
    '/aur/license/{packageName}': {
      get: {
        summary: 'AUR License',
        description: 'Arch linux User Repository License',
        parameters: pathParams({
          name: 'packageName',
          example: 'android-studio',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

  transform(json) {
    const licenses = json.results[0].License
    if (!licenses) {
      throw new NotFound({ prettyMessage: 'not specified' })
    }

    return { licenses }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    const { licenses } = this.transform(json)
    return renderLicenseBadge({ licenses, color: 'blue' })
  }
}

class AurVotes extends BaseAurService {
  static category = 'rating'

  static route = { base: 'aur/votes', pattern: ':packageName' }

  static openApi = {
    '/aur/votes/{packageName}': {
      get: {
        summary: 'AUR Votes',
        description: 'Arch linux User Repository Votes',
        parameters: pathParams({ name: 'packageName', example: 'dropbox' }),
      },
    },
  }

  static defaultBadgeData = { label: 'votes' }

  static render({ votes }) {
    return {
      message: metric(votes),
      color: floorCountColor(votes, 2, 20, 60),
    }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ votes: json.results[0].NumVotes })
  }
}

class AurPopularity extends BaseAurService {
  static category = 'rating'

  static route = { base: 'aur/popularity', pattern: ':packageName' }

  static openApi = {
    '/aur/popularity/{packageName}': {
      get: {
        summary: 'AUR Popularity',
        description: 'Arch linux User Repository Popularity',
        parameters: pathParams({ name: 'packageName', example: 'dropbox' }),
      },
    },
  }

  static defaultBadgeData = { label: 'popularity' }

  static render({ popularity }) {
    return {
      message: popularity,
      color: floorCountColor(popularity, 0.5, 2.5, 5),
    }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ popularity: json.results[0].Popularity })
  }
}

class AurVersion extends BaseAurService {
  static category = 'version'
  static route = { base: 'aur/version', pattern: ':packageName' }

  static openApi = {
    '/aur/version/{packageName}': {
      get: {
        summary: 'AUR Version',
        description: 'Arch linux User Repository Version',
        parameters: pathParams({
          name: 'packageName',
          example: 'visual-studio-code-bin',
        }),
      },
    },
  }

  static _cacheLength = 3600

  static render({ version, outOfDate }) {
    const color = outOfDate === null ? 'blue' : 'orange'
    return renderVersionBadge({ version, versionFormatter: () => color })
  }

  async handle({ packageName }) {
    const {
      results: [{ Version: version, OutOfDate: outOfDate }],
    } = await this.fetch({ packageName })
    return this.constructor.render({
      version,
      outOfDate,
    })
  }
}

class AurMaintainer extends BaseAurService {
  static category = 'other'

  static route = { base: 'aur/maintainer', pattern: ':packageName' }

  static openApi = {
    '/aur/maintainer/{packageName}': {
      get: {
        summary: 'AUR Maintainer',
        description: 'Arch linux User Repository Maintainer',
        parameters: pathParams({
          name: 'packageName',
          example: 'google-chrome',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'maintainer', color: 'blue' }

  static render({ maintainer }) {
    return { message: maintainer }
  }

  async handle({ packageName }) {
    const {
      results: [{ Maintainer: maintainer }],
    } = await this.fetch({ packageName })
    if (!maintainer) {
      throw new InvalidResponse({ prettyMessage: 'No maintainer' })
    }
    return this.constructor.render({ maintainer })
  }
}

class AurLastModified extends BaseAurService {
  static category = 'activity'

  static route = {
    base: 'aur/last-modified',
    pattern: ':packageName',
  }

  static openApi = {
    '/aur/last-modified/{packageName}': {
      get: {
        summary: 'AUR Last Modified',
        description: 'Arch linux User Repository Last Modified',
        parameters: pathParams({
          name: 'packageName',
          example: 'google-chrome',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'last modified' }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    const date = 1000 * parseInt(json.results[0].LastModified)
    return renderDateBadge(date)
  }
}

export {
  AurLicense,
  AurVersion,
  AurVotes,
  AurPopularity,
  AurMaintainer,
  AurLastModified,
}
