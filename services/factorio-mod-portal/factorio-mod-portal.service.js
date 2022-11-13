import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { renderVersionBadge } from '../version.js'

const schema = Joi.object({
  releases: Joi.array()
    .items(
      Joi.object({
        version: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
}).required()

class BaseFactorioModPortalService extends BaseJsonService {
  async fetch({ modName }) {
    return this._requestJson({
      schema,
      url: `https://mods.factorio.com/api/mods/${modName}`,
      errorMessages: {
        404: 'mod not found',
      },
    })
  }
}

class FactorioModPortalLatestVersion extends BaseFactorioModPortalService {
  static category = 'version'

  static route = { base: 'factorio-mod-portal/v', pattern: ':modName' }
  static examples = [
    {
      title: 'Factorio Mod Portal',
      namedParams: { modName: 'rso-mod' },
      staticPreview: this.render({ version: '6.2.20' }),
    },
  ]

  static defaultBadgeData = { label: 'latest version' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ modName }) {
    const { releases } = await this.fetch({ modName })
    const version = releases[releases.length - 1].version
    return this.constructor.render({ version })
  }
}

export { FactorioModPortalLatestVersion }
