import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { renderVersionBadge } from '../version.js'

const schema = Joi.object({
  releases: Joi.array()
    .items(
      Joi.object({
        version: Joi.string().required(),
        info_json: Joi.object({
          factorio_version: Joi.string().required(),
        }).required(),
      })
    )
    .min(1)
    .required(),
}).required()

class BaseFactorioModPortalService extends BaseJsonService {
  async fetch({ modName }) {
    const { releases } = await this._requestJson({
      schema,
      url: `https://mods.factorio.com/api/mods/${modName}`,
      errorMessages: {
        404: 'mod not found',
      },
    })

    return {
      first_release: releases[0],
      latest_release: releases[releases.length - 1],
    }
  }
}

class FactorioModPortalLatestVersion extends BaseFactorioModPortalService {
  static category = 'version'

  static route = {
    base: 'factorio-mod-portal/lv',
    pattern: ':modName',
  }

  static examples = [
    {
      title: 'Factorio Mod Portal mod version',
      namedParams: { modName: 'rso-mod' },
      staticPreview: this.render({ version: '6.2.20' }),
    },
  ]

  static defaultBadgeData = { label: 'latest version' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ modName }) {
    const { latest_release } = await this.fetch({ modName })
    return this.constructor.render({ version: latest_release.version })
  }
}

class FactorioModPortalFactorioVersions extends BaseFactorioModPortalService {
  static category = 'version'

  static route = {
    base: 'factorio-mod-portal/fv',
    pattern: ':modName',
  }

  static examples = [
    {
      title: 'Factorio Mod Portal factorio versions',
      namedParams: { modName: 'rso-mod' },
      staticPreview: this.render({ versions: '0.14-1.1' }),
    },
  ]

  static defaultBadgeData = { label: 'factorio version' }

  static render({ versions }) {
    return { message: versions, color: 'blue' }
  }

  combine({ earliest, latest }) {
    let versions = ''
    if (earliest === latest) {
      versions = earliest
    } else {
      versions = `${earliest}-${latest}`
    }
    return { versions }
  }

  async handle({ modName }) {
    const { first_release, latest_release } = await this.fetch({ modName })
    const { versions } = this.combine({
      earliest: first_release.info_json.factorio_version,
      latest: latest_release.info_json.factorio_version,
    })
    return this.constructor.render({ versions })
  }
}

export { FactorioModPortalLatestVersion, FactorioModPortalFactorioVersions }
