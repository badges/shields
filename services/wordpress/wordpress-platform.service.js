import { NotFound, pathParams } from '../index.js'
import { addv } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
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

    static render({ wordpressVersion }) {
      return {
        message: addv(wordpressVersion),
        color: versionColor(wordpressVersion),
      }
    }

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

      return this.constructor.render({ wordpressVersion })
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

  static renderStaticPreview({ testedVersion }) {
    // Since this badge has an async `render()` function, but `get examples()` has to
    // be synchronous, this method exists. It should return the same value as the
    // real `render()`.
    return {
      message: `${addv(testedVersion)} tested`,
      color: 'brightgreen',
    }
  }

  static async render({ testedVersion }) {
    // Atypically, the `render()` function of this badge is `async` because it needs to pull
    // data from the server.
    return {
      message: `${addv(testedVersion)} tested`,
      color: await versionColorForWordpressVersion(testedVersion),
    }
  }

  async handle({ slug }) {
    const { tested: testedVersion } = await this.fetch({
      extensionType: 'plugin',
      slug,
    })
    return this.constructor.render({ testedVersion })
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

    static render({ version }) {
      return {
        label: 'php',
        message: `>=${version}`,
        color: versionColor(version),
      }
    }

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

      return this.constructor.render({
        version: requiresPhp,
      })
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
