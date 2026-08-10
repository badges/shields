import { NotFound, pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { BaseClassicpress, description } from './classicpress-base.js'

const extensionData = {
  plugin: {
    capt: 'Plugin',
    exampleSlug: 'switch-to-classicpress',
  },
  theme: {
    capt: 'Theme',
    exampleSlug: 'kagumi',
  },
}

function ClassicpressRequiresVersion(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class ClassicpressRequiresVersion extends BaseClassicpress {
    static name = `Classicpress${capt}RequiresVersion`

    static category = 'platform-support'

    static route = {
      base: `classicpress/${extensionType}/cp-version`,
      pattern: ':slug',
    }

    static get openApi() {
      const key = `/classicpress/${extensionType}/cp-version/{slug}`
      const route = {}
      route[key] = {
        get: {
          summary: `ClassicPress ${capt}: Required CP Version`,
          description,
          parameters: pathParams({
            name: 'slug',
            example: exampleSlug,
          }),
        },
      }
      return route
    }

    static defaultBadgeData = { label: 'classicpress' }

    async handle({ slug }) {
      const { requires_cp: classicpressVersion } = await this.fetch({
        extensionType,
        slug,
      })

      if (classicpressVersion === '') {
        throw new NotFound({
          prettyMessage: `not set for this ${extensionType}`,
        })
      }

      return renderVersionBadge({ version: classicpressVersion })
    }
  }
}

function ClassicpressRequiresPHPVersion(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class ClassicpressRequiresPHPVersion extends BaseClassicpress {
    static name = `Classicpress${capt}RequiresPHPVersion`

    static category = 'platform-support'

    static route = {
      base: `classicpress/${extensionType}/required-php`,
      pattern: ':slug',
    }

    static get openApi() {
      const key = `/classicpress/${extensionType}/required-php/{slug}`
      const route = {}
      route[key] = {
        get: {
          summary: `ClassicPress ${capt} Required PHP Version`,
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

      if (requiresPhp === '') {
        throw new NotFound({
          prettyMessage: `not set for this ${extensionType}`,
        })
      }

      return renderVersionBadge({ version: requiresPhp, prefix: '>=' })
    }
  }
}

const requiresVersion = ['plugin', 'theme'].map(ClassicpressRequiresVersion)
const requiredPhp = ['plugin', 'theme'].map(ClassicpressRequiresPHPVersion)
export default [...requiresVersion, ...requiredPhp]
