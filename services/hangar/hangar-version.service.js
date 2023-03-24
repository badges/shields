import { renderVersionBadge } from '../version.js'
import { BaseHangarService, documentation } from './hangar-base.js'

export default class HangarVersion extends BaseHangarService {
  static category = 'version'

  static route = {
    base: 'hangar/v',
    pattern: ':author/:slug',
  }

  static examples = [
    {
      title: 'Hangar Version',
      // Sorry Geyser, you should of uploaded a SemVer version.
      namedParams: { author: 'jmp', slug: 'MiniMOTD' },
      staticPreview: renderVersionBadge({ version: '6.6.6' }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'version' }

  async handle({ author, slug }) {
    const project = `${author}/${slug}`
    console.log(author, slug, project)
    const { 0: latestVersion } = (await this.fetchVersions({ project })).result
    const version = latestVersion.name
    return renderVersionBadge({ version })
  }
}
