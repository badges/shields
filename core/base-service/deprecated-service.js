'use strict'

const Joi = require('@hapi/joi')
const camelcase = require('camelcase')
const BaseService = require('./base')
const { isValidCategory } = require('./categories')
const { Deprecated } = require('./errors')
const { isValidRoute } = require('./route')

const attrSchema = Joi.object({
  route: isValidRoute,
  name: Joi.string(),
  label: Joi.string(),
  category: isValidCategory,
  // The content of examples is validated later, via `transformExamples()`.
  examples: Joi.array().default([]),
  message: Joi.string(),
  dateAdded: Joi.date().required(),
}).required()

function deprecatedService(attrs) {
  const { route, name, label, category, examples, message } = Joi.attempt(
    attrs,
    attrSchema,
    `Deprecated service for ${attrs.route.base}`
  )

  return class DeprecatedService extends BaseService {
    static get name() {
      return name
        ? `Deprecated${name}`
        : `Deprecated${camelcase(route.base.replace(/\//g, '_'), {
            pascalCase: true,
          })}`
    }

    static get category() {
      return category
    }

    static get isDeprecated() {
      return true
    }

    static get route() {
      return route
    }

    static get examples() {
      return examples
    }

    static get defaultBadgeData() {
      return { label }
    }

    async handle() {
      throw new Deprecated({ prettyMessage: message })
    }
  }
}

module.exports = deprecatedService
