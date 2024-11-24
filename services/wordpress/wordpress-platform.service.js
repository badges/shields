import { NotFound, pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { description, BaseWordpress } from './wordpress-base.js'
import { versionColorForWordpressVersion } from './wordpress-version-color.js'

const extensionData = {
  plugin: {
    capt: 'Plugin',
    exampleSlug: 'bbpress',
  },
  theme: {
    capt: 'Theme',
    exampleSlug: 'twentytwenty',
  },
}

function WordpressRequiresVersion(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressRequiresVersion extends BaseWordpress {
    static name = `Wordpress${capt}RequiresVersion`

    static category = 'platform-support'

    static route = {
      base: `wordpress/${extensionType}/wp-version`,
      pattern: ':slug',
    }

    static get openApi() {
      const key = `/wordpress/${extensionType}/wp-version/{slug}`
      const route = {}
      route[key] = {
        get: {
          summary: `WordPress ${capt}: Required WP Version`,
          description,
          parameters: pathParams({
            name: 'slug',
            example: exampleSlug,
          }),
        },
      }
      return route
    }

    static defaultBadgeData = { label: 'wordpress' }

    async handle({ slug }) {
      const { requires: wordpressVersion } = await this.fetch({
        extensionType,
        slug,
      })

      if (wordpressVersion === false) {
        throw new NotFound({
          prettyMessage: `not set for this ${extensionType}`,
        })
      }

      return renderVersionBadge({ version: wordpressVersion })
    }
  }
}

class WordpressPluginTestedVersion extends BaseWordpress {
  static category = 'platform-support'

  static route = {
    base: 'wordpress/plugin/tested',
    pattern: ':slug',
  }

  static openApi = {
    '/wordpress/plugin/tested/{slug}': {
      get: {
        summary: 'WordPress Plugin: Tested WP Version',
        description,
        parameters: pathParams({
          name: 'slug',
          example: 'bbpress',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'wordpress' }

  async handle({ slug }) {
    const { tested: testedVersion } = await this.fetch({
      extensionType: 'plugin',
      slug,
    })
    // Atypically, pulling color data from the server with async operation.
    const color = await versionColorForWordpressVersion(testedVersion)
    return renderVersionBadge({
      version: testedVersion,
      suffix: 'tested',
      versionFormatter: () => color,
    })
  }
}

function RequiresPHPVersionForType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressRequiresPHPVersion extends BaseWordpress {
    static name = `Wordpress${capt}RequiresPHPVersion`

    static category = 'platform-support'

    static route = {
      base: `wordpress/${extensionType}/required-php`,
      pattern: ':slug',
    }

    static get openApi() {
      const key = `/wordpress/${extensionType}/required-php/{slug}`
      const route = {}
      route[key] = {
        get: {
          summary: `WordPress ${capt} Required PHP Version`,
          description,
          parameters: pathParams({
            name: 'slug',
            example: exampleSlug,
          }),
        },
      }
      return route
    }

    static defaultBadgeData = { label: 'php' }

    async handle({ slug }) {
      const { requires_php: requiresPhp } = await this.fetch({
        extensionType,
        slug,
      })

      if (requiresPhp === false) {
        throw new NotFound({
          prettyMessage: `not set for this ${extensionType}`,
        })
      }

      return renderVersionBadge({ version: requiresPhp, prefix: '>=' })
    }
  }
}

const requiredPhp = ['plugin', 'theme'].map(RequiresPHPVersionForType)
const requiresVersion = ['plugin', 'theme'].map(WordpressRequiresVersion)
export default [
  ...requiredPhp,
  ...requiresVersion,
  WordpressPluginTestedVersion,
]
