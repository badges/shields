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
      }),
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
      httpErrors: {
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
    const resp = await this.fetch({ modName })
    return this.constructor.render({ version: resp.latest_release.version })
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
    const resp = await this.fetch({ modName })
    const version = resp.latest_release.info_json.factorio_version
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
        lastUpdated: new Date(),
      }),
    },
  ]

  static defaultBadgeData = { label: 'last updated' }

  static render({ lastUpdated }) {
    return {
      message: formatDate(lastUpdated),
      color: age(lastUpdated),
    }
  }

  async handle({ modName }) {
    const resp = await this.fetch({ modName })
    return this.constructor.render({
      lastUpdated: resp.latest_release.released_at,
    })
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
        downloads: 1694763,
      }),
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads })
  }

  async handle({ modName }) {
    const resp = await this.fetch({ modName })
    return this.constructor.render({ downloads: resp.downloads_count })
  }
}

export {
  FactorioModPortalLatestVersion,
  FactorioModPortalLastUpdated,
  FactorioModPortalFactorioVersion,
  FactorioModPortalDownloads,
}
