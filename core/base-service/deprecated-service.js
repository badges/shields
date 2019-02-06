'use strict'

const BaseService = require('./base')
const { Deprecated } = require('./errors')

// Only `url` is required.
function deprecatedService({ route, label, category, examples = [], message }) {
  return class DeprecatedService extends BaseService {
    static get category() {
      return category
    }

    static get route() {
      return route
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
      throw new Deprecated({ prettyMessage: message })
    }
  }
}

module.exports = deprecatedService
