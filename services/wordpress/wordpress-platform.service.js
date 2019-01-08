'use strict'

const BaseWordpress = require('./wordpress-base')
const semver = require('semver')
const Joi = require('joi')
const { addv } = require('../../lib/text-formatters')
const { version: versionColor } = require('../../lib/color-formatters')
const { NotFound } = require('../errors')

const coreSchema = Joi.object()
  .keys({
    offers: Joi.array()
      .items(
        Joi.object()
          .keys({
            version: Joi.string()
              .regex(/^\d+(\.\d+)?(\.\d+)?$/)
              .required(),
          })
          .required()
      )
      .required(),
  })
  .required()

class BaseWordpressPlatform extends BaseWordpress {
  static get defaultBadgeData() {
    return { label: 'wordpress' }
  }
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
  static get route() {
    return {
      base: `wordpress/plugin/wp-version`,
      pattern: ':slug',
    }
  }

  static get examples() {
    return [
      {
        title: 'Wordpress Plugin: Required WP Version',
        namedParams: { slug: 'bbpress' },
        staticPreview: this.render({ response: { requires: '4.8' } }),
      },
    ]
  }
}

class WordpressPluginTestedVersion extends BaseWordpressPlatform {
  static render({ version, color }) {
    return {
      message: `${addv(version)} tested`,
      color,
    }
  }

  async fetchCore() {
    const coreURL = 'https://api.wordpress.org/core/version-check/1.7/'
    return this._requestJson({
      url: coreURL,
      schema: coreSchema,
    })
  }

  async handle({ slug }) {
    const json = await this.fetch({ slug })
    const core = await this.fetchCore()

    if (!json || !core) {
      throw new NotFound()
    }

    //Copy & Paste old color formatting code.
    const versions = core.offers.map(v => v.version)
    let testedVersion = json.tested
    let color = ''
    const svTestedVersion =
      testedVersion.split('.').length === 2
        ? (testedVersion += '.0')
        : testedVersion
    const svVersion =
      versions[0].split('.').length === 2 ? (versions[0] += '.0') : versions[0]

    if (
      testedVersion === versions[0] ||
      semver.gtr(svTestedVersion, svVersion)
    ) {
      color = 'brightgreen'
    } else if (versions.indexOf(testedVersion) !== -1) {
      color = 'orange'
    } else {
      color = 'yellow'
    }

    return this.constructor.render({ version: testedVersion, color })
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
        title: 'Wordpress Plugin: Tested WP Version',
        pattern: ':slug',
        namedParams: { slug: 'bbpress' },
        staticPreview: this.render({ version: '4.9.8', color: 'brightgreen' }),
        documentation: `<p>There is an alias for this badge. <code>wordpress/v/:slug.svg</code></p>`,
      },
    ]
  }
}

class WordpressPluginTestedVersionAlias extends WordpressPluginTestedVersion {
  static get route() {
    return {
      base: `wordpress/v`,
      pattern: ':slug',
    }
  }

  //The alias is documented in the above class.
  static get examples() {
    return []
  }
}

module.exports = {
  WordpressPluginRequiresVersion,
  WordpressPluginTestedVersion,
  WordpressPluginTestedVersionAlias,
}
