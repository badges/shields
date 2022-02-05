import Joi from 'joi'
import {
  floorCount as floorCountColor,
  age as ageColor,
} from '../color-formatters.js'
import { renderLicenseBadge } from '../licenses.js'
import { addv, metric, formatDate } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, NotFound, InvalidResponse } from '../index.js'

const aurSchema = Joi.object({
  resultcount: nonNegativeInteger,
  results: Joi.array()
    .items(
      Joi.object({
        License: Joi.array().items(Joi.string().required()).allow(null),
        NumVotes: nonNegativeInteger,
        Version: Joi.string().required(),
        OutOfDate: nonNegativeInteger.allow(null),
        Maintainer: Joi.string().required().allow(null),
        LastModified: nonNegativeInteger,
      })
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

  static examples = [
    {
      title: 'AUR license',
      namedParams: { packageName: 'android-studio' },
      staticPreview: renderLicenseBadge({ license: 'Apache', color: 'blue' }),
    },
  ]

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

  static examples = [
    {
      title: 'AUR votes',
      namedParams: { packageName: 'dropbox' },
      staticPreview: this.render({ votes: '2280' }),
    },
  ]

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

class AurVersion extends BaseAurService {
  static category = 'version'

  static route = { base: 'aur/version', pattern: ':packageName' }

  static examples = [
    {
      title: 'AUR version',
      namedParams: { packageName: 'visual-studio-code-bin' },
      staticPreview: this.render({ version: '1.34.0-2', outOfDate: null }),
    },
  ]

  static render({ version, outOfDate }) {
    const color = outOfDate === null ? 'blue' : 'orange'
    return { message: addv(version), color }
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

  static examples = [
    {
      title: 'AUR maintainer',
      namedParams: { packageName: 'google-chrome' },
      staticPreview: this.render({ maintainer: 'luzifer' }),
    },
  ]

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

  static examples = [
    {
      title: 'AUR last modified',
      namedParams: { packageName: 'google-chrome' },
      staticPreview: this.render({ date: new Date().getTime() }),
    },
  ]

  static defaultBadgeData = { label: 'last modified' }

  static render({ date }) {
    const color = ageColor(date)
    const message = formatDate(date)
    return { color, message }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    const date = 1000 * parseInt(json.results[0].LastModified)
    return this.constructor.render({ date })
  }
}

export { AurLicense, AurVersion, AurVotes, AurMaintainer, AurLastModified }
