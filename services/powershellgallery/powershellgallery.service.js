'use strict'

const Joi = require('joi')

const BaseXmlService = require('../base-xml')
const { NotFound } = require('../errors')
const { nonNegativeInteger } = require('../validators')
const { createFilter } = require('../nuget/nuget-v2-service-family')
const {
  renderVersionBadge,
  renderDownloadBadge,
} = require('../nuget/nuget-helpers')

const WINDOWS_TAG_NAME = 'windows'
const MACOS_TAG_NAME = 'macos'
const LINUX_TAG_NAME = 'linux'

const schema = Joi.object({
  feed: Joi.object({
    entry: Joi.object({
      'm:properties': Joi.object({
        'd:Version': Joi.string(),
        'd:NormalizedVersion': Joi.string(),
        'd:DownloadCount': nonNegativeInteger,
        'd:Tags': Joi.string(),
      }),
    }),
  }).required(),
}).required()

async function fetch(
  serviceInstance,
  { packageName, includePrereleases = false }
) {
  const data = await serviceInstance._requestXml({
    schema,
    url: `https://www.powershellgallery.com/api/v2/Search()`,
    options: {
      qs: { $filter: createFilter({ packageName, includePrereleases }) },
    },
  })

  const packageData =
    'entry' in data.feed ? data.feed.entry['m:properties'] : undefined

  if (packageData) {
    return packageData
  } else if (!includePrereleases) {
    return fetch(serviceInstance, {
      packageName,
      includePrereleases: true,
    })
  } else {
    throw new NotFound()
  }
}

class PowershellGalleryVersion extends BaseXmlService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'powershellgallery',
      pattern: ':which(v|vpre)/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'PowerShell Gallery',
        pattern: 'v/:packageName',
        namedParams: { which: 'v', packageName: 'Azure.Storage' },
        staticExample: this.render({ version: '4.4.0' }),
      },
      {
        title: 'PowerShell Gallery (with prereleases)',
        pattern: 'vpre/:packageName',
        namedParams: { which: 'vpre', packageName: 'Azure.Storage' },
        staticExample: this.render({ version: '4.4.1-preview' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'powershell gallery',
    }
  }

  static render(props) {
    return renderVersionBadge(props)
  }

  async handle({ which, packageName }) {
    const packageData = await fetch(this, {
      packageName,
      includePrereleases: which === 'vpre',
    })
    const version =
      packageData['d:NormalizedVersion'] || packageData['d:Version']
    return this.constructor.render({ version })
  }
}

class PowershellGalleryDownloads extends BaseXmlService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'powershellgallery/dt',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'PowerShell Gallery',
        namedParams: { packageName: 'Azure.Storage' },
        staticExample: this.render({ downloads: 1.2e7 }),
      },
    ]
  }

  static render(props) {
    return renderDownloadBadge(props)
  }

  async handle({ packageName }) {
    const packageData = await fetch(this, {
      packageName,
    })
    const { 'd:DownloadCount': downloads } = packageData
    return this.constructor.render({ downloads })
  }
}

class PowershellGalleryPlatformSupport extends BaseXmlService {
  static get category() {
    return 'platform-support'
  }

  static get defaultBadgeData() {
    return {
      label: 'platform',
    }
  }

  static get route() {
    return {
      base: 'powershellgallery/p',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'PowerShell Gallery',
        namedParams: { packageName: 'Az.Storage' },
        staticExample: this.render({
          platforms: ['windows', 'macos', 'linux'],
        }),
      },
    ]
  }

  static render({ platforms }) {
    return {
      message: platforms.join(' | '),
    }
  }

  async handle({ packageName }) {
    const packageData = await fetch(this, {
      packageName,
    })
    const { 'd:Tags': tagStr } = packageData

    const platforms = new Set()
    const tagArr = tagStr.split(' ')

    for (const tag of tagArr) {
      switch (tag.toLowerCase()) {
        // Look for Windows
        case WINDOWS_TAG_NAME:
          platforms.add(WINDOWS_TAG_NAME.toLowerCase())
          break

        // Look for MacOS
        case MACOS_TAG_NAME:
          platforms.add(MACOS_TAG_NAME.toLowerCase())
          break

        // Look for Linux
        case LINUX_TAG_NAME:
          platforms.add(LINUX_TAG_NAME.toLowerCase())
          break

        default:
          break
      }
    }

    if (platforms.size === 0) {
      platforms.add('not specified')
    }

    return this.constructor.render({ platforms: [...platforms] })
  }
}

module.exports = {
  PowershellGalleryVersion,
  PowershellGalleryDownloads,
  PowershellGalleryPlatformSupport,
}
