import { BaseHangarService, documentation } from './hangar-base.js'

export default class HangarPlatformVersions extends BaseHangarService {
  static category = 'platform-support'

  static route = {
    base: 'hangar/project-platform-versions',
    pattern: ':author/:slug/:platform',
  }

  static examples = [
    {
      title: 'Hangar Platform Supported Versions',
      namedParams: { author: 'GeyserMC', slug: 'Geyser', platform: 'PAPER' },
      staticPreview: this.render({ versions: '1.7.10-1.20' }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'game versions' }

  static render({ platformSupportedVersions }) {
    return {
      message: platformSupportedVersions,
      color: 'blue',
    }
  }

  async handle({ author, slug, platform }) {
    const project = `${author}/${slug}`
    const { 0: latest } = (await this.fetchVersions(project)).result
    const platformSupportedVersions =
      latest.platformDependenciesFormatted[platform]
    return this.constructor.render({ platformSupportedVersions })
  }
}
