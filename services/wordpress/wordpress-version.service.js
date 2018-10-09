'use strict'

const BaseWordpress = require('./wordpress-base')
const { addv } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

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

  return class WordpressPluginVersion extends BaseWordpress {
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

    static get url() {
      return {
        base: `wordpress/${extensionType}/v`,
        format: '(.+)',
        capture: ['slug'],
      }
    }

    static get examples() {
      return [
        {
          title: `Wordpress ${capt} Version`,
          exampleUrl: exampleSlug,
          urlPattern: ':slug',
          staticExample: this.render({ response: { version: 2.5 } }),
          keywords: ['wordpress'],
        },
      ]
    }
  }
}

module.exports = ['theme', 'plugin'].map(VersionForExtensionType)
