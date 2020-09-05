'use strict'

const { NotFound } = require('..')
const { addv } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const BaseWordpress = require('./wordpress-base')
const { versionColorForWordpressVersion } = require('./wordpress-version-color')

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

function RequiresForType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressRequiresVersion extends BaseWordpress {
    static get name() {
      return `Wordpress${capt}RequiresVersion`
    }

    static get category() {
      return 'platform-support'
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}/wp-version`,
        pattern: ':slug',
      }
    }

    static get examples() {
      return [
        {
          title: `WordPress ${capt} Required WP Version`,
          namedParams: { slug: exampleSlug },
          staticPreview: this.render({ wordpressVersion: '4.8' }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: 'wordpress' }
    }

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
      return this.constructor.render({ wordpressVersion })
    }
  }
}

class WordpressPluginTestedVersion extends BaseWordpress {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: `wordpress/plugin/tested`,
      pattern: ':slug',
    }
  }

  static get examples() {
    return [
      {
        title: 'WordPress Plugin Tested WP Version',
        namedParams: { slug: 'bbpress' },
        staticPreview: this.renderStaticPreview({
          testedVersion: '4.9.8',
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'wordpress' }
  }

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
    static get name() {
      return `Wordpress${capt}RequiresPHPVersion`
    }

    static get category() {
      return 'platform-support'
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}/required-php`,
        pattern: ':slug',
      }
    }

    static get examples() {
      return [
        {
          title: `WordPress ${capt} Required PHP Version`,
          namedParams: { slug: exampleSlug },
          staticPreview: this.render({ version: '5.5' }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: 'required php' }
    }

    static render({ version }) {
      return {
        label: 'required php',
        message: addv(version),
        color: versionColor(version),
      }
    }

    async handle({ slug }) {
      const { requires_php } = await this.fetch({
        extensionType,
        slug,
      })

      if (requires_php === false) {
        throw new NotFound({
          prettyMessage: `not set for this ${extensionType}`,
        })
      }

      return this.constructor.render({
        version: requires_php,
      })
    }
  }
}

const requiresVersion = ['plugin', 'theme'].map(RequiresForType)
const required_php = ['plugin', 'theme'].map(RequiresPHPVersionForType)
module.exports = [
  ...requiresVersion,
  WordpressPluginTestedVersion,
  ...required_php,
]
