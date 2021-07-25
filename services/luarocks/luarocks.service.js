import Joi from 'joi'
import { addv } from '../text-formatters.js'
import { BaseJsonService, NotFound } from '../index.js'
import { latestVersion } from './luarocks-version-helpers.js'

const schema = Joi.object({
  repository: Joi.object()
    .pattern(
      Joi.string(),
      Joi.object().pattern(Joi.string(), Joi.array().strip())
    )
    .required(),
}).required()

export default class Luarocks extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'luarocks/v',
    pattern: ':user/:moduleName/:version?',
  }

  static examples = [
    {
      title: 'LuaRocks',
      namedParams: {
        user: 'mpeterv',
        moduleName: 'luacheck',
      },
      staticPreview: this.render({ version: '0.23.0-1' }),
    },
  ]

  static defaultBadgeData = {
    label: 'luarocks',
  }

  static render({ version }) {
    // The badge colors are following the heuristic rule where `scm < dev <
    // stable` (e.g., `scm-1` < `dev-1` < `0.1.0-1`).
    let color
    switch (version.slice(0, 3).toLowerCase()) {
      case 'dev':
        color = 'yellow'
        break
      case 'scm':
      case 'cvs':
        color = 'orange'
        break
      default:
        color = 'brightgreen'
    }

    return { message: addv(version), color }
  }

  async fetch({ user, moduleName }) {
    const { repository } = await this._requestJson({
      url: `https://luarocks.org/manifests/${encodeURIComponent(
        user
      )}/manifest.json`,
      schema,
      errorMessages: {
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
    return this.constructor.render({ version })
  }
}
