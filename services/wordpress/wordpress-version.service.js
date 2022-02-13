import { addv } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import { documentation, BaseWordpress } from './wordpress-base.js'

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

    static examples = [
      {
        title: `WordPress ${capt} Version`,
        namedParams: { slug: exampleSlug },
        staticPreview: this.render({ version: 2.5 }),
        documentation,
      },
    ]

    static defaultBadgeData = { label: extensionType }

    static render({ version }) {
      return {
        message: addv(version),
        color: versionColor(version),
      }
    }

    async handle({ slug }) {
      const { version } = await this.fetch({
        extensionType,
        slug,
      })
      return this.constructor.render({ version })
    }
  }
}

export default ['theme', 'plugin'].map(VersionForExtensionType)
