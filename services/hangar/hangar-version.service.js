import { renderVersionBadge } from '../version.js'
import {
  BaseHangarService,
  documentation as originalDocumentation,
  keywords,
} from './hangar-base.js'

const documentation = `${originalDocumentation}
<p>The channel is case-sensitive.</p>`

export default class HangarVersion extends BaseHangarService {
  static category = 'version'

  static route = {
    base: 'hangar/v',
    pattern: ':author/:slug/:channel?',
  }

  static examples = [
    {
      title: 'Hangar Version',
      namedParams: {
        author: 'William278',
        slug: 'HuskHomes',
      },
      staticPreview: renderVersionBadge({
        version: '4.2',
      }),
      documentation,
      keywords,
    },
    {
      title: 'Hangar Version with custom release channel',
      namedParams: {
        author: 'William278',
        slug: 'HuskHomes',
        channel: 'Alpha',
      },
      staticPreview: renderVersionBadge({
        version: '4.2-ebfe84c',
      }),
      documentation,
      keywords,
    },
  ]

  async handle({ author, slug, channel }) {
    let version
    if (channel === undefined) {
      version = await this.fetchPlain({
        author,
        slug,
      })
    } else {
      version = await this.fetchPlain({
        searchParams: {
          channel,
        },
        url: `https://hangar.papermc.io/api/v1/projects/${author}/${slug}/latest`,
      })
    }
    return renderVersionBadge({
      version,
    })
  }
}
