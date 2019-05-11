'use strict'

const { addv } = require('../text-formatters')
const { version: versionColor } = require('../color-formatters')
const BaseWordpress = require('./wordpress-base')
const { versionColorForWordpressVersion } = require('./wordpress-version-color')

class WordpressPluginRequiresVersion extends BaseWordpress {
  static get category() {
    return 'platform-support'
  }

  static get route() {
    return {
      base: `wordpress/plugin/wp-version`,
      pattern: ':slug',
    }
  }

  static get examples() {
    return [
      {
        title: 'WordPress Plugin: Required WP Version',
        namedParams: { slug: 'bbpress' },
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
      extensionType: 'plugin',
      slug,
    })
    return this.constructor.render({ wordpressVersion })
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
        title: 'WordPress Plugin: Tested WP Version',
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

module.exports = {
  WordpressPluginRequiresVersion,
  WordpressPluginTestedVersion,
}
