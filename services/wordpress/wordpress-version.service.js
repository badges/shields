import { pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { description, BaseWordpress } from './wordpress-base.js'

function VersionForExtensionType(extensionType) {
  const { capt, exampleSlug } = {
    plugin: {
      capt: 'Plugin',
      exampleSlug: 'bbpress',
    },
    theme: {
      capt: 'Theme',
      exampleSlug: 'twentyseventeen',
    },
  }[extensionType]

  return class WordpressVersion extends BaseWordpress {
    static name = `Wordpress${capt}Version`

    static category = 'version'

    static route = {
      base: `wordpress/${extensionType}/v`,
      pattern: ':slug',
    }

    static get openApi() {
      const key = `/wordpress/${extensionType}/v/{slug}`
      const route = {}
      route[key] = {
        get: {
          summary: `WordPress ${capt} Version`,
          description,
          parameters: pathParams({
            name: 'slug',
            example: exampleSlug,
          }),
        },
      }
      return route
    }

    static defaultBadgeData = { label: extensionType }

    async handle({ slug }) {
      const { version } = await this.fetch({
        extensionType,
        slug,
      })
      return renderVersionBadge({ version })
    }
  }
}

export default ['theme', 'plugin'].map(VersionForExtensionType)
