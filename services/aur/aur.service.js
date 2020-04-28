'use strict'

const Joi = require('@hapi/joi')
const { floorCount: floorCountColor } = require('../color-formatters')
const { addv, metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, NotFound } = require('..')
const { formatDate } = require('../text-formatters')
const { age: ageColor } = require('../color-formatters')
const { InvalidResponse } = require('..')

const aurSchema = Joi.object({
  resultcount: nonNegativeInteger,
  results: Joi.alternatives(
    Joi.array()
      .length(0)
      .required(),
    Joi.object({
      License: Joi.string()
        .required()
        .allow(null),
      NumVotes: nonNegativeInteger,
      Version: Joi.string().required(),
      OutOfDate: nonNegativeInteger.allow(null),
      Maintainer: Joi.string()
        .required()
        .allow(null),
      LastModified: nonNegativeInteger,
    }).required()
  ),
}).required()

class BaseAurService extends BaseJsonService {
  static get defaultBadgeData() {
    return { label: 'aur' }
  }

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
      url: 'https://aur.archlinux.org/rpc.php',
      options: { qs: { type: 'info', arg: packageName } },
    })
  }
}

class AurLicense extends BaseAurService {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'aur/license',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'AUR license',
        namedParams: { packageName: 'android-studio' },
        staticPreview: this.render({ license: 'Apache' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  static render({ license }) {
    return { message: license, color: 'blue' }
  }

  transform(json) {
    const license = json.results.License
    if (!license) {
      throw new NotFound({ prettyMessage: 'not specified' })
    }

    return { license }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    const { license } = this.transform(json)
    return this.constructor.render({ license })
  }
}

class AurVotes extends BaseAurService {
  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'aur/votes',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'AUR votes',
        namedParams: { packageName: 'dropbox' },
        staticPreview: this.render({ votes: '2280' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'votes' }
  }

  static render({ votes }) {
    return {
      message: metric(votes),
      color: floorCountColor(votes, 2, 20, 60),
    }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ votes: json.results.NumVotes })
  }
}

class AurVersion extends BaseAurService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'aur/version',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'AUR version',
        namedParams: { packageName: 'visual-studio-code-bin' },
        staticPreview: this.render({ version: '1.34.0-2', outOfDate: null }),
      },
    ]
  }

  static render({ version, outOfDate }) {
    const color = outOfDate === null ? 'blue' : 'orange'
    return { message: addv(version), color }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({
      version: json.results.Version,
      outOfDate: json.results.OutOfDate,
    })
  }
}

class AurMaintainer extends BaseAurService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'aur/maintainer',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'AUR maintainer',
        namedParams: { packageName: 'google-chrome' },
        staticPreview: this.render({ maintainer: 'luzifer' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'maintainer', color: 'blue' }
  }

  static render({ maintainer }) {
    return { message: maintainer }
  }

  async handle({ packageName }) {
    const {
      results: { Maintainer: maintainer },
    } = await this.fetch({ packageName })
    if (!maintainer) {
      throw new InvalidResponse({ prettyMessage: 'No maintainer' })
    }
    return this.constructor.render({ maintainer })
  }
}

class AurLastModified extends BaseAurService {
  static get category() {
    return 'activity'
  }

  static get route() {
    return {
      base: 'aur/last-modified',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'AUR last modified',
        namedParams: { packageName: 'google-chrome' },
        staticPreview: this.render({ date: new Date().getTime() }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'last modified' }
  }

  static render({ date }) {
    const color = ageColor(date)
    const message = formatDate(date)
    return { color, message }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    const date = 1000 * parseInt(json.results.LastModified)
    return this.constructor.render({ date })
  }
}

module.exports = {
  AurLicense,
  AurVersion,
  AurVotes,
  AurMaintainer,
  AurLastModified,
}
