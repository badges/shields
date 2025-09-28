import { pathParams } from '../index.js'
import { parseDate, renderDateBadge } from '../date.js'
import { description, BaseWordpress } from './wordpress-base.js'

const extensionData = {
  plugin: {
    capt: 'Plugin',
    exampleSlug: 'bbpress',
    lastUpdateFormat: 'YYYY-MM-DD h:mma [GMT]',
  },
  theme: {
    capt: 'Theme',
    exampleSlug: 'twentyseventeen',
    lastUpdateFormat: 'YYYY-MM-DD',
  },
}

function LastUpdateForType(extensionType) {
  const { capt, exampleSlug, lastUpdateFormat } = extensionData[extensionType]

  return class WordpressLastUpdate extends BaseWordpress {
    static name = `Wordpress${capt}LastUpdated`

    static category = 'activity'

    static route = {
      base: `wordpress/${extensionType}/last-updated`,
      pattern: ':slug',
    }

    static get openApi() {
      const key = `/wordpress/${extensionType}/last-updated/{slug}`
      const route = {}
      route[key] = {
        get: {
          summary: `WordPress ${capt} Last Updated`,
          description,
          parameters: pathParams({
            name: 'slug',
            example: exampleSlug,
          }),
        },
      }
      return route
    }

    static defaultBadgeData = { label: 'last updated' }

    async handle({ slug }) {
      const { last_updated: lastUpdated } = await this.fetch({
        extensionType,
        slug,
      })

      const date = parseDate(lastUpdated, lastUpdateFormat)

      return renderDateBadge(date)
    }
  }
}

const lastupdate = ['plugin', 'theme'].map(LastUpdateForType)
export default [...lastupdate]
