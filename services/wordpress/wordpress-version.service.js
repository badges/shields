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

    static get extensionType() {
      return extensionType
    }

    static render({ response }) {
      return {
        message: addv(response.version),
        color: versionColor(response.version),
      }
    }

    static get category() {
      return 'version'
    }

    static get defaultBadgeData() {
      return { label: extensionType }
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
          title: `Wordpress ${capt} Version`,
          namedParams: { slug: exampleSlug },
          staticPreview: this.render({ response: { version: 2.5 } }),
        },
      ]
    }
  }
}

module.exports = ['theme', 'plugin'].map(VersionForExtensionType)
