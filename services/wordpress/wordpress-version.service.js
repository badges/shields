'use strict'

const { addv } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const BaseWordpress = require('./wordpress-base')

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

module.exports = ['theme', 'plugin'].map(VersionForExtensionType)
