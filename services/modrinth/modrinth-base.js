import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { nonNegativeInteger } from '../validators.js'

const projectSchema = Joi.object({
  downloads: nonNegativeInteger,
  followers: nonNegativeInteger,
}).required()

const versionSchema = Joi.array()
  .items(
    Joi.object({
      version_number: Joi.string().required(),
      game_versions: Joi.array().items(Joi.string()).min(1).required(),
    }).required(),
  )
  .required()

const description =
  "<p>You can use your project slug, or the project ID. The ID can be found in the 'Technical information' section of your Modrinth page.</p>"

class BaseModrinthService extends BaseJsonService {
  async fetchVersions({ projectId }) {
    return this._requestJson({
      schema: versionSchema,
      url: `https://api.modrinth.com/v2/project/${projectId}/version`,
    })
  }

  async fetchProject({ projectId }) {
    return this._requestJson({
      schema: projectSchema,
      url: `https://api.modrinth.com/v2/project/${projectId}`,
    })
  }
}

export { BaseModrinthService, description }
