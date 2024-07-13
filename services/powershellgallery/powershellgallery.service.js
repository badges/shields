import { fetch, createServiceFamily } from '../nuget/nuget-v2-service-family.js'
import { BaseXmlService, pathParams } from '../index.js'

const WINDOWS_TAG_NAME = 'windows'
const MACOS_TAG_NAME = 'macos'
const LINUX_TAG_NAME = 'linux'

const apiBaseUrl = 'https://www.powershellgallery.com/api/v2'

const {
  NugetVersionService: PowershellGalleryVersion,
  NugetVersionRedirector: PowershellGalleryVersionRedirector,
  NugetDownloadService: PowershellGalleryDownloads,
} = createServiceFamily({
  name: 'PowershellGallery',
  defaultLabel: 'powershell gallery',
  serviceBaseUrl: 'powershellgallery',
  apiBaseUrl,
  title: 'PowerShell Gallery',
  examplePackageName: 'Azure.Storage',
})

class PowershellGalleryPlatformSupport extends BaseXmlService {
  static category = 'platform-support'

  static route = {
    base: 'powershellgallery/p',
    pattern: ':packageName',
  }

  static openApi = {
    '/powershellgallery/p/{packageName}': {
      get: {
        summary: 'PowerShell Gallery Platform Support',
        parameters: pathParams({
          name: 'packageName',
          example: 'PackageManagement',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'platform',
  }

  static render({ platforms }) {
    return {
      message: platforms.join(' | '),
    }
  }

  async handle({ packageName }) {
    const { Tags: tagStr } = await fetch(this, {
      baseUrl: apiBaseUrl,
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

export {
  PowershellGalleryVersion,
  PowershellGalleryVersionRedirector,
  PowershellGalleryDownloads,
  PowershellGalleryPlatformSupport,
}
