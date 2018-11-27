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

const schema = Joi.object({
  feed: Joi.object({
    entry: Joi.object({
      'm:properties': Joi.object({
        'd:Version': Joi.string(),
        'd:NormalizedVersion': Joi.string(),
        'd:DownloadCount': nonNegativeInteger,
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

module.exports = { PowershellGalleryVersion, PowershellGalleryDownloads }
