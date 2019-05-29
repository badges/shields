'use strict'

const {
  fetch,
  createServiceFamily,
} = require('../nuget/nuget-v2-service-family')
const { BaseXmlService } = require('..')

const WINDOWS_TAG_NAME = 'windows'
const MACOS_TAG_NAME = 'macos'
const LINUX_TAG_NAME = 'linux'

const apiBaseUrl = 'https://www.powershellgallery.com/api/v2'

const {
  NugetVersionService: PowershellGalleryVersion,
  NugetDownloadService: PowershellGalleryDownloads,
} = createServiceFamily({
  name: 'PowershellGallery',
  defaultLabel: 'powershell gallery',
  serviceBaseUrl: 'powershellgallery',
  apiBaseUrl,
  odataFormat: 'xml',
  title: 'PowerShell Gallery',
  examplePackageName: 'Azure.Storage',
  exampleVersion: '4.4.0',
  examplePrereleaseVersion: '4.4.1-preview',
  exampleDownloadCount: 1.2e7,
})

class PowershellGalleryPlatformSupport extends BaseXmlService {
  static get category() {
    return 'platform-support'
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
        namedParams: { packageName: 'DNS.1.1.1.1' },
        staticPreview: this.render({
          platforms: ['windows', 'macos', 'linux'],
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'platform',
    }
  }

  static render({ platforms }) {
    return {
      message: platforms.join(' | '),
    }
  }

  async handle({ packageName }) {
    const { Tags: tagStr } = await fetch(this, {
      baseUrl: apiBaseUrl,
      odataFormat: 'xml',
      packageName,
    })

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
