'use strict'

const Joi = require('joi')
const { BaseJsonService } = require('../base')
const { nonNegativeInteger, anyInteger } = require('../validators.js')

// API doc: https://libraries.io/api#project
const schema = Joi.object({
  dependents_count: nonNegativeInteger,
  dependent_repos_count: nonNegativeInteger,
  rank: anyInteger,
}).required()

class LibrariesIoBase extends BaseJsonService {
  static buildUrl(base) {
    return {
      base,
      format: '(\\w+)/(.+)',
      capture: ['platform', 'packageName'],
    }
  }

  async fetch({ platform, packageName }) {
    return this._requestJson({
      schema,
      url: `https://libraries.io/api/${platform}/${packageName}`,
      notFoundMessage: 'package not found',
    })
  }
}

module.exports = LibrariesIoBase
