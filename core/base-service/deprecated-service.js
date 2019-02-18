'use strict'

const Joi = require('joi')
const BaseService = require('./base')
const { Deprecated } = require('./errors')

// Only `url` is required.
function deprecatedService({
  route,
  label,
  category,
  examples = [],
  message,
  dateAdded,
}) {
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

    static validateDefinition() {
      super.validateDefinition()
      Joi.assert(
        { dateAdded },
        Joi.object({
          dateAdded: Joi.date().required(),
        }),
        `Deprecated service for ${route.base}`
      )
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
