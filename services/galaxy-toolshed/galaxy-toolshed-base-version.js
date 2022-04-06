import Joi from 'joi'
import { version as versionColor } from '../color-formatters.js'
import { addv as versionText } from '../text-formatters.js'
import BaseGalaxyToolshedService from './galaxy-toolshed-base.js'

export default class GalaxyToolshedBaseVersion extends BaseGalaxyToolshedService {
  static repositoryRevisionInstallInfoSchema = Joi.array().items(
    Joi.object({}),
    Joi.object({
      changeset_revision: Joi.string().required(),
      valid_tools: Joi.array()
        .items(
          Joi.object({
            requirements: Joi.array()
              .items(
                Joi.object({
                  name: Joi.string().required(),
                  version: Joi.string().required(),
                }).required()
              )
              .required(),
            id: Joi.string().required(),
            name: Joi.string().required(),
            version: Joi.string().required(),
          }).required()
        )
        .required(),
    }).required(),
    Joi.object({})
  )

  static render({ label, version }) {
    return {
      label,
      message: versionText(version),
      color: versionColor(version),
    }
  }
}
