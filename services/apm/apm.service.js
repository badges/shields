import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import { renderVersionBadge } from '../version.js'
import { renderDownloadsBadge } from '../downloads.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService, InvalidResponse } from '../index.js'

const keywords = ['atom']

const schema = Joi.object({
  downloads: nonNegativeInteger,
  releases: Joi.object({
    latest: Joi.string().required(),
  }),
  metadata: Joi.object({
    license: Joi.string().required(),
  }),
})

class BaseAPMService extends BaseJsonService {
  static defaultBadgeData = { label: 'apm' }

  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://atom.io/api/packages/${packageName}`,
      errorMessages: { 404: 'package not found' },
    })
  }
}

class APMDownloads extends BaseAPMService {
  static category = 'downloads'
  static route = { base: 'apm/dm', pattern: ':packageName' }

  static examples = [
    {
      title: 'APM',
      namedParams: { packageName: 'vim-mode' },
      staticPreview: this.render({ downloads: '60043' }),
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'downloads' }

  static render({ downloads }) {
    return renderDownloadsBadge({ downloads, colorOverride: 'green' })
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })
    return this.constructor.render({ downloads: json.downloads })
  }
}

class APMVersion extends BaseAPMService {
  static category = 'version'
  static route = { base: 'apm/v', pattern: ':packageName' }

  static examples = [
    {
      title: 'APM',
      namedParams: { packageName: 'vim-mode' },
      staticPreview: this.render({ version: '0.6.0' }),
      keywords,
    },
  ]

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })

    const version = json.releases.latest
    if (!version)
      throw new InvalidResponse({
        underlyingError: new Error('version is invalid'),
      })
    return this.constructor.render({ version })
  }
}

class APMLicense extends BaseAPMService {
  static category = 'license'
  static route = { base: 'apm/l', pattern: ':packageName' }

  static examples = [
    {
      title: 'APM',
      namedParams: { packageName: 'vim-mode' },
      staticPreview: this.render({ license: 'MIT' }),
      keywords,
    },
  ]

  static defaultBadgeData = { label: 'license' }

  static render({ license }) {
    return renderLicenseBadge({ license })
  }

  async handle({ packageName }) {
    const json = await this.fetch({ packageName })

    const license = json.metadata.license
    if (!license)
      throw new InvalidResponse({
        underlyingError: new Error('licence is invalid'),
      })
    return this.constructor.render({ license })
  }
}

export { APMDownloads, APMVersion, APMLicense }
