'use strict'

const BaseJsonService = require('../base-json')
const BaseWordpress = require('./wordpress-base')
const { metric } = require('../../lib/text-formatters')
const { downloadCount } = require('../../lib/color-formatters')
const { NotFound } = require('../errors')
const Joi = require('joi')

const dateSchema = Joi.object()
  .pattern(Joi.date().iso(), Joi.number().integer())
  .required()

const extensionData = {
  plugin: {
    capt: 'Plugin',
    exampleSlug: 'bbpress',
  },
  theme: {
    capt: 'Theme',
    exampleSlug: 'twentyseventeen',
  },
}

function DownloadsForExtensionType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressDownloads extends BaseWordpress {
    static render({ response }) {
      return {
        message: metric(response.downloaded),
        color: downloadCount(response.downloaded),
      }
    }

    static get category() {
      return 'downloads'
    }

    static get defaultBadgeData() {
      return { label: 'downloads' }
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}/dt`,
        pattern: ':slug',
      }
    }
    static get extensionType() {
      return extensionType
    }

    static get examples() {
      return [
        {
          title: `Wordpress ${capt} Downloads`,
          namedParams: { slug: exampleSlug },
          staticExample: this.render({ response: { downloaded: 200000 } }),
          keywords: ['wordpress'],
        },
      ]
    }
  }
}

function InstallsForExtensionType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressInstalls extends BaseWordpress {
    static get extensionType() {
      return extensionType
    }

    static get category() {
      return 'downloads'
    }

    static render({ response }) {
      return {
        message: `${metric(response.active_installs)}+`,
        color: downloadCount(response.active_installs),
      }
    }

    static get defaultBadgeData() {
      return { label: 'active installs' }
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}/installs`,
        format: '(.+)',
        capture: ['slug'],
      }
    }

    static get examples() {
      return [
        {
          title: `Wordpress ${capt} Active Installs`,
          exampleUrl: exampleSlug,
          pattern: ':slug',
          staticExample: this.render({ response: { active_installs: 300000 } }),
          keywords: ['wordpress'],
        },
      ]
    }
  }
}

function DownloadsForInterval(interval) {
  const { base, messageSuffix = '', query } = {
    day: {
      base: 'wordpress/plugin/dd',
      messageSuffix: '/day',
      query: 1,
    },
    week: {
      base: 'wordpress/plugin/dw',
      messageSuffix: '/week',
      query: 7,
    },
    month: {
      base: 'wordpress/plugin/dm',
      messageSuffix: '/month',
      query: 30,
    },
    year: {
      base: 'wordpress/plugin/dy',
      messageSuffix: '/year',
      query: 365,
    },
  }[interval]

  return class WordpressDownloads extends BaseJsonService {
    static get category() {
      return 'downloads'
    }

    static get defaultBadgeData() {
      return { label: 'downloads' }
    }

    static get route() {
      return {
        base,
        format: '(.*)',
        capture: ['slug'],
      }
    }

    static get examples() {
      return [
        {
          title: 'WordPress Plugin Downloads',
          exampleUrl: 'bbpress',
          pattern: ':slug',
          staticExample: this.render({ downloads: 30000 }),
          keywords: ['wordpress'],
        },
      ]
    }

    static render({ downloads }) {
      return {
        message: `${metric(downloads)}${messageSuffix}`,
        color: downloadCount(downloads),
      }
    }

    async handle({ slug }) {
      const json = await this._requestJson({
        schema: dateSchema,
        url: `https://api.wordpress.org/stats/plugin/1.0/downloads.php`,
        options: {
          qs: {
            slug,
            limit: query,
          },
        },
      })
      const size = Object.keys(json).length
      const downloads = Object.values(json).reduce(
        (a, b) => parseInt(a) + parseInt(b)
      )
      // This check is for non-existant and brand-new plugins both having new stats.
      // Non-Existant plugins results are the same as a brandspanking new plugin with no downloads.
      if (downloads <= 0 && size <= 1) {
        throw new NotFound({ prettyMessage: 'plugin not found or too new' })
      }
      return this.constructor.render({ downloads })
    }
  }
}

const intervalServices = ['day', 'week', 'month', 'year'].map(
  DownloadsForInterval
)
const downloadServices = ['plugin', 'theme'].map(DownloadsForExtensionType)
const installServices = ['plugin', 'theme'].map(InstallsForExtensionType)
const modules = [...intervalServices, ...downloadServices, ...installServices]
module.exports = modules
