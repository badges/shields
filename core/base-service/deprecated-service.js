'use strict'

const BaseService = require('./base')
const { Deprecated } = require('./errors')

// Only `url` is required.
function deprecatedService({ url, label, category, examples = [] }) {
  return class DeprecatedService extends BaseService {
    static get category() {
      return category
    }

    static get route() {
      return url
    }

    static get isDeprecated() {
      return true
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
