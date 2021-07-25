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
    }).required()
  ),
}).required()

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

export { BasePuppetForgeModulesService, BasePuppetForgeUsersService }
