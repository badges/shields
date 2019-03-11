'use strict'

const Joi = require('joi')
const { version: versionColor } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')
const { BaseJsonService } = require('..')

const clojarsSchema = Joi.object({
  downloads: nonNegativeInteger,
  latest_version: Joi.string(),
  latest_release: Joi.string(),
})
  .required()
  .oxor('latest_release', 'latest_version')

class BaseClojarsService extends BaseJsonService {
  async fetch({ clojar }) {
    // Clojars API Doc: https://github.com/clojars/clojars-web/wiki/Data
    const url = `https://clojars.org/api/artifacts/${clojar}`
    return this._requestJson({
      url,
      schema: clojarsSchema,
    })
  }
}

class BaseClojarsVersionService extends BaseClojarsService {
  static render({ clojar, version }) {
    return {
      message: `[${clojar} "${version}"]`,
      color: versionColor(version),
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

module.exports = { BaseClojarsService, BaseClojarsVersionService }
