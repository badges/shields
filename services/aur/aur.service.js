'use strict'

const Joi = require('@hapi/joi')
const { floorCount: floorCountColor } = require('../color-formatters')
const { addv, metric } = require('../text-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, NotFound } = require('..')

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
        namedParams: { packageName: 'pac' },
        staticPreview: this.render({ license: 'MIT' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'license' }
  }

  static render({ license }) {
    return { message: license, color: 'blue' }
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ license: json.results.License })
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

module.exports = {
  AurLicense,
  AurVersion,
  AurVotes,
}
