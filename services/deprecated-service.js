'use strict'

const BaseService = require('./base')
const { Deprecated } = require('./errors')

function deprecatedService({ category, url, label, examples = [] }) {
  return class DeprecatedService extends BaseService {
    static get category() {
      return category
    }

    static get url() {
      return url
    }

    static get defaultBadgeData() {
      return { label }
    }

    static get examples() {
      return examples
    }

    async handle() {
      throw new Deprecated()
    }
  }
}

module.exports = deprecatedService
