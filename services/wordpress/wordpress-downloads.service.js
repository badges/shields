'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const BaseWordpress = require('./wordpress-base')
const { BaseJsonService, NotFound } = require('..')

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
    static get name() {
      return `Wordpress${capt}Downloads`
    }

    static get category() {
      return 'downloads'
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}/dt`,
        pattern: ':slug',
      }
    }

    static get examples() {
      return [
        {
          title: `WordPress ${capt} Downloads`,
          namedParams: { slug: exampleSlug },
          staticPreview: this.render({ downloads: 200000 }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: 'downloads' }
    }

    static render({ downloads }) {
      return {
        message: metric(downloads),
        color: downloadCount(downloads),
      }
    }

    async handle({ slug }) {
      const { downloaded: downloads } = await this.fetch({
        extensionType,
        slug,
      })
      return this.constructor.render({ downloads })
    }
  }
}

function InstallsForExtensionType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

  return class WordpressInstalls extends BaseWordpress {
    static get name() {
      return `Wordpress${capt}Installs`
    }

    static get category() {
      return 'downloads'
    }

    static get route() {
      return {
        base: `wordpress/${extensionType}/installs`,
        pattern: ':slug',
      }
    }

    static get examples() {
      return [
        {
          title: `WordPress ${capt} Active Installs`,
          namedParams: { slug: exampleSlug },
          staticPreview: this.render({ installCount: 300000 }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: 'active installs' }
    }

    static render({ installCount }) {
      return {
        message: metric(installCount),
        color: downloadCount(installCount),
      }
    }

    async handle({ slug }) {
      const { active_installs: installCount } = await this.fetch({
        extensionType,
        slug,
      })
      return this.constructor.render({ installCount })
    }
  }
}

function DownloadsForInterval(interval) {
  const { base, messageSuffix = '', query, name } = {
    day: {
      base: 'wordpress/plugin/dd',
      messageSuffix: '/day',
      query: 1,
      name: 'WordpressDownloadsDay',
    },
    week: {
      base: 'wordpress/plugin/dw',
      messageSuffix: '/week',
      query: 7,
      name: 'WordpressDownloadsWeek',
    },
    month: {
      base: 'wordpress/plugin/dm',
      messageSuffix: '/month',
      query: 30,
      name: 'WordpressDownloadsMonth',
    },
    year: {
      base: 'wordpress/plugin/dy',
      messageSuffix: '/year',
      query: 365,
      name: 'WordpressDownloadsYear',
    },
  }[interval]

  return class WordpressDownloads extends BaseJsonService {
    static get name() {
      return name
    }

    static get category() {
      return 'downloads'
    }

    static get route() {
      return {
        base,
        pattern: ':slug',
      }
    }

    static get examples() {
      return [
        {
          title: 'WordPress Plugin Downloads',
          namedParams: { slug: 'bbpress' },
          staticPreview: this.render({ downloads: 30000 }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: 'downloads' }
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
      // This check is for non-existent and brand-new plugins both having new stats.
      // Non-Existent plugins results are the same as a brandspanking new plugin with no downloads.
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
