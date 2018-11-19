'use strict'

const Joi = require('joi')
const { floorCount: floorCountColor } = require('../../lib/color-formatters')
const { addv: versionText } = require('../../lib/text-formatters')
const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')
const { nonNegativeInteger } = require('../validators')

const aurSchema = Joi.object({
  resultcount: nonNegativeInteger,
  results: Joi.alternatives(
    Joi.array()
      .length(0)
      .required(),
    Joi.object({
      License: Joi.string().required(),
      NumVotes: nonNegativeInteger,
      Version: Joi.string().required(),
      OutOfDate: nonNegativeInteger.allow(null),
    }).required()
  ),
}).required()

class BaseAurService extends BaseJsonService {
  async fetch({ pkg }) {
    return this._requestJson({
      schema: aurSchema,
      url: `https://aur.archlinux.org/rpc.php?type=info&arg=${pkg}`,
    })
  }

  static get defaultBadgeData() {
    return { label: 'aur' }
  }

  static _validate(data, schema) {
    if (data.resultcount === 0) {
      // Note the 'not found' response from Arch Linux is:
      // status code = 200,
      // body = {"version":1,"type":"info","resultcount":0,"results":[]}
      throw new NotFound()
    }
    return super._validate(data, schema)
  }
}

class AurLicense extends BaseAurService {
  static render({ license }) {
    return { message: license, color: 'blue' }
  }

  async handle({ pkg }) {
    const json = await this.fetch({ pkg })
    return this.constructor.render({ license: json.results.License })
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'aur/license',
      format: '(.+)',
      capture: ['pkg'],
    }
  }

  static get examples() {
    return [
      {
        title: `AUR license`,
        pattern: ':package',
        exampleUrl: 'yaourt',
        staticExample: this.render({ license: 'GPL' }),
      },
    ]
  }
}

class AurVotes extends BaseAurService {
  static render({ votes }) {
    return {
      message: votes,
      color: floorCountColor(votes, 2, 20, 60),
    }
  }

  async handle({ pkg }) {
    const json = await this.fetch({ pkg })
    return this.constructor.render({ votes: json.results.NumVotes })
  }

  static get defaultBadgeData() {
    return { label: 'votes' }
  }

  static get category() {
    return 'rating'
  }

  static get route() {
    return {
      base: 'aur/votes',
      format: '(.+)',
      capture: ['pkg'],
    }
  }

  static get examples() {
    return [
      {
        title: `AUR votes`,
        pattern: ':package',
        exampleUrl: 'yaourt',
        staticExample: this.render({ license: '3029' }),
      },
    ]
  }
}

class AurVersion extends BaseAurService {
  static render({ version, outOfDate }) {
    const color = outOfDate === null ? 'blue' : 'orange'
    return { message: versionText(version), color }
  }

  async handle({ pkg }) {
    const json = await this.fetch({ pkg })
    return this.constructor.render({
      version: json.results.Version,
      outOfDate: json.results.OutOfDate,
    })
  }

  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'aur/version',
      format: '(.+)',
      capture: ['pkg'],
    }
  }

  static get examples() {
    return [
      {
        title: `AUR version`,
        pattern: ':package',
        exampleUrl: 'yaourt',
        staticExample: this.render({ version: 'v1.9-1', outOfDate: null }),
      },
    ]
  }
}

module.exports = {
  AurLicense,
  AurVersion,
  AurVotes,
}
