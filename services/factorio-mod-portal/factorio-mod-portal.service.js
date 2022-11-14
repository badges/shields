import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import { age } from '../color-formatters.js'
import { formatDate } from '../text-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { renderDownloadsBadge } from '../downloads.js'
import { renderVersionBadge } from '../version.js'

const schema = Joi.object({
  downloads_count: nonNegativeInteger,
  releases: Joi.array()
    .items(
      Joi.object({
        version: Joi.string().required(),
        released_at: Joi.string().required(),
        info_json: Joi.object({
          factorio_version: Joi.string().required(),
        }).required(),
      })
    )
    .min(1)
    .required(),
}).required()

// Factorio Mod portal API
// @see https://wiki.factorio.com/Mod_portal_API
class BaseFactorioModPortalService extends BaseJsonService {
  async fetch({ modName }) {
    const { releases, downloads_count } = await this._requestJson({
      schema,
      url: `https://mods.factorio.com/api/mods/${modName}`,
      errorMessages: {
        404: 'mod not found',
      },
    })

    return {
      downloads_count,
      latest_release: releases[releases.length - 1],
    }
  }
}

// Badge for mod's latest updated version
class FactorioModPortalLatestVersion extends BaseFactorioModPortalService {
  static category = 'version'

  static route = {
    base: 'factorio-mod-portal/v',
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

// Badge for mod's latest compatible Factorio version
class FactorioModPortalFactorioVersion extends BaseFactorioModPortalService {
  static category = 'platform-support'

  static route = {
    base: 'factorio-mod-portal/factorio-version',
    pattern: ':modName',
  }

  static examples = [
    {
      title: 'Factorio Mod Portal factorio versions',
      namedParams: { modName: 'rso-mod' },
      staticPreview: this.render({ version: '1.1' }),
    },
  ]

  static defaultBadgeData = { label: 'factorio version' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ modName }) {
    const { latest_release } = await this.fetch({ modName })
    const version = latest_release.info_json.factorio_version
    return this.constructor.render({ version })
  }
}

// Badge for mod's last updated date
class FactorioModPortalLastUpdated extends BaseFactorioModPortalService {
  static category = 'activity'

  static route = {
    base: 'factorio-mod-portal/last-updated',
    pattern: ':modName',
  }

  static examples = [
    {
      title: 'Factorio Mod Portal mod',
      namedParams: { modName: 'rso-mod' },
      staticPreview: this.render({
        last_updated: new Date(),
      }),
    },
  ]

  static defaultBadgeData = { label: 'last updated' }

  static render({ last_updated }) {
    return {
      message: formatDate(last_updated),
      color: age(last_updated),
    }
  }

  async handle({ modName }) {
    const { latest_release } = await this.fetch({ modName })
    return this.constructor.render({ last_updated: latest_release.released_at })
  }
}

// Badge for mod's total download count
class FactorioModPortalDownloads extends BaseFactorioModPortalService {
  static category = 'downloads'

  static route = {
    base: 'factorio-mod-portal/dt',
    pattern: ':modName',
  }

  static examples = [
    {
      title: 'Factorio Mod Portal mod downloads',
      namedParams: { modName: 'rso-mod' },
      staticPreview: this.render({
        downloads_count: 1694763,
      }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads_count }) {
    return renderDownloadsBadge({ downloads: downloads_count })
  }

  async handle({ modName }) {
    const { downloads_count } = await this.fetch({ modName })
    return this.constructor.render({ downloads_count })
  }
}

export {
  FactorioModPortalLatestVersion,
  FactorioModPortalLastUpdated,
  FactorioModPortalFactorioVersion,
  FactorioModPortalDownloads,
}
