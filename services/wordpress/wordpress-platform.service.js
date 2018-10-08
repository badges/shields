'use strict'

const BaseWordpress = require('./wordpress-base')
const { addv } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')

class BaseWordpressPlatform extends BaseWordpress {
  static get extensionType() {
    return 'plugin'
  }

  static render({ response }) {
    return {
      message: addv(response.requires),
      color: versionColor(response.requires),
    }
  }

  static get category() {
    return 'platform-support'
  }
}

class WordpressPluginRequiresVersion extends BaseWordpressPlatform {
  static get defaultBadgeData() {
    return { label: 'requires' }
  }

  static get url() {
    return {
      base: `wordpress/v`,
      format: '(.+)',
      capture: ['slug'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Wordpress Plugin: Required WP Version',
        exampleUrl: 'bbpress',
        urlPattern: 'slug',
        staticExample: this.render({ response: { requires: '4.5' } }),
        keywords: ['wordpress'],
      },
    ]
  }
}

class WordpressPluginTestedVersion extends BaseWordpressPlatform {
  static get defaultBadgeData() {
    return { label: 'tested' }
  }

  static render({ response }) {
    return {
      message: addv(response.tested),
      color: versionColor(response.tested),
    }
  }

  static get url() {
    return {
      base: `wordpress/plugin/tested`,
      format: '(.+)',
      capture: ['slug'],
    }
  }

  static get examples() {
    return [
      {
        title: 'Wordpress Plugin: Tested WP Version',
        exampleUrl: 'bbpress',
        urlPattern: 'slug',
        staticExample: this.render({ response: { tested: '4.5.4' } }),
        keywords: ['wordpress'],
      },
    ]
  }
}

module.exports = {
  WordpressPluginRequiresVersion,
  WordpressPluginTestedVersion,
}
