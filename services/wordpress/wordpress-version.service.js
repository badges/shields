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
    static get name() {
      return `Wordpress${capt}Version`
    }

    static get category() {
      return 'version'
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}/v`,
        pattern: ':slug',
      }
    }

    static get examples() {
      return [
        {
          title: `WordPress ${capt} Version`,
          namedParams: { slug: exampleSlug },
          staticPreview: this.render({ version: 2.5 }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: extensionType }
    }

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
