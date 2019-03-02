'use strict'

const Joi = require('joi')
const { version: versionColor } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService, InvalidResponse } = require('..')

const clojarsSchema = Joi.object({
  downloads: nonNegativeInteger,
  latest_version: Joi.string().required(),
  latest_release: Joi.string().required(),
}).required()

class BaseClojarsService extends BaseJsonService {
  async fetch({ clojar }) {
    const url = `https://clojars.org/api/artifacts/${clojar}`
    return this._requestJson({
      url,
      schema: clojarsSchema,
      errorMessages: {
        404: 'not found',
      },
    })
  }
}

class ClojarsVersionService extends BaseClojarsService {
  static render({ clojar, version }) {
    return {
      message: `[${clojar} "${version}"]`,
      color: versionColor(version),
    }
  }

  static transform(json, version) {
    if (version === 'release') {
      return { version: json.latest_release }
    } else if (version === 'version') {
      return { version: json.latest_version }
    } else {
      throw new InvalidResponse({
        prettyMessage: new Error('version is invalid or null'),
      })
    }
  }

  static get defaultBadgeData() {
    return { label: 'clojars' }
  }

  static get category() {
    return 'version'
  }

  static get examples() {
    return [
      {
        namedParams: { clojar: 'prismic' },
        staticPreview: this.render({ clojar: 'clojar', version: '1.2' }),
      },
    ]
  }
}

module.exports = { BaseClojarsService, ClojarsVersionService }
