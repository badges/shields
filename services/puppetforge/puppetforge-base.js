import Joi from 'joi'
import { nonNegativeInteger, semver } from '../validators.js'
import { BaseJsonService } from '../index.js'

const usersSchema = Joi.object({
  module_count: nonNegativeInteger,
  release_count: nonNegativeInteger,
}).required()

const modulesSchema = Joi.object({
  endorsement: Joi.string().allow(null),
  feedback_score: Joi.number().integer().min(0).allow(null),
  downloads: nonNegativeInteger,
  current_release: Joi.alternatives(
    Joi.object({
      pdk: Joi.boolean().valid(true).required(),
      version: semver,
      metadata: Joi.object({ 'pdk-version': semver }).required(),
    }).required(),
    Joi.object({
      pdk: Joi.boolean().valid(false).required(),
      version: semver,
    }).required(),
  ),
}).required()

const modulesValidationSchema = Joi.array()
  .items(
    Joi.alternatives().try(
      Joi.object({
        name: Joi.string().valid('total').required(),
        score: nonNegativeInteger,
      }).required(),
      Joi.object({}).required(),
    ),
  )
  .custom((value, helpers) => {
    // Custom validation to check for exactly one type1 object
    const totalCount = value.filter(item => item.name === 'total').length
    if (totalCount !== 1) {
      return helpers.message(
        'Array must contain exactly one object of type "total"',
      )
    }
    return value
  })

class BasePuppetForgeUsersService extends BaseJsonService {
  async fetch({ user }) {
    return this._requestJson({
      schema: usersSchema,
      url: `https://forgeapi.puppetlabs.com/v3/users/${user}`,
    })
  }
}

class BasePuppetForgeModulesService extends BaseJsonService {
  async fetch({ user, moduleName }) {
    return this._requestJson({
      schema: modulesSchema,
      url: `https://forgeapi.puppetlabs.com/v3/modules/${user}-${moduleName}`,
    })
  }
}

class BasePuppetForgeModulesValidationService extends BaseJsonService {
  async fetch({ user, moduleName }) {
    return this._requestJson({
      schema: modulesValidationSchema,
      url: `https://forgeapi.puppetlabs.com/private/validations/${user}-${moduleName}`,
    })
  }
}

export {
  BasePuppetForgeModulesService,
  BasePuppetForgeUsersService,
  BasePuppetForgeModulesValidationService,
}
