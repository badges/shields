import Joi from 'joi'
import { BaseJsonService, NotFound, pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { latestVersion } from './luarocks-version-helpers.js'

const schema = Joi.object({
  repository: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object().pattern(Joi.string(), Joi.array().strip()),
    )
    .required(),
}).required()

export default class Luarocks extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'luarocks/v',
    pattern: ':user/:moduleName/:version?',
  }

  static openApi = {
    '/luarocks/v/{user}/{moduleName}': {
      get: {
        summary: 'LuaRocks',
        parameters: pathParams(
          {
            name: 'user',
            example: 'mpeterv',
          },
          {
            name: 'moduleName',
            example: 'luacheck',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'luarocks',
  }

  async fetch({ user, moduleName }) {
    const { repository } = await this._requestJson({
      url: `https://luarocks.org/manifests/${encodeURIComponent(
        user,
      )}/manifest.json`,
      schema,
      httpErrors: {
        404: 'user not found',
      },
    })
    const moduleData = repository[moduleName]
    if (!moduleData) {
      throw new NotFound({ prettyMessage: 'module not found' })
    }
    return moduleData
  }

  async handle({ user, moduleName, version: requestedVersion }) {
    const moduleInfo = await this.fetch({ user, moduleName })

    let version
    if (requestedVersion) {
      if (!(requestedVersion in moduleInfo)) {
        throw new NotFound({ prettyMessage: 'version not found' })
      }
      version = requestedVersion
    } else {
      const versions = Object.keys(moduleInfo)
      version = latestVersion(versions)
    }
    return renderVersionBadge({ version })
  }
}
