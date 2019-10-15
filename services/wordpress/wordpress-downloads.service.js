'use strict'

const Joi = require('@hapi/joi')
const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const BaseWordpress = require('./wordpress-base')
const { NotFound } = require('..')

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

const intervalMap = {
  dd: {
    limit: 1,
    messageSuffix: '/day',
  },
  dw: {
    limit: 7,
    messageSuffix: '/week',
  },
  dm: {
    limit: 30,
    messageSuffix: '/month',
  },
  dy: {
    limit: 365,
    messageSuffix: '/year',
  },
  dt: {
    limit: null,
    messageSuffix: '',
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
        base: `wordpress/${extensionType}`,
        pattern: ':interval(dd|dw|dm|dy|dt)/:slug',
      }
    }

    static get examples() {
      return [
        {
          title: `WordPress ${capt} Downloads`,
          namedParams: { interval: 'dm', slug: exampleSlug },
          staticPreview: this.render({ interval: 'dm', downloads: 200000 }),
        },
      ]
    }

    static get defaultBadgeData() {
      return { label: 'downloads' }
    }

    static render({ interval, downloads }) {
      const { messageSuffix } = intervalMap[interval]

      return {
        message: `${metric(downloads)}${messageSuffix}`,
        color: downloadCount(downloads),
      }
    }

    async handle({ interval, slug }) {
      const { limit } = intervalMap[interval]
      let downloads
      if (limit === null) {
        const { downloaded: _downloads } = await this.fetch({
          extensionType,
          slug,
        })
        downloads = _downloads
      } else {
        const ext_type = extensionType === 'plugin' ? 'plugin' : 'themes'
        const json = await this._requestJson({
          schema: dateSchema,
          url: `https://api.wordpress.org/stats/${ext_type}/1.0/downloads.php`,
          options: {
            qs: {
              slug,
              limit,
            },
          },
        })
        const size = Object.keys(json).length
        downloads = Object.values(json).reduce(
          (a, b) => parseInt(a) + parseInt(b)
        )
        // This check is for non-existent and brand-new plugins both having new stats.
        // Non-Existent plugins results are the same as a brandspanking new plugin with no downloads.
        if (downloads <= 0 && size <= 1) {
          throw new NotFound({
            prettyMessage: `${extensionType} not found or too new`,
          })
        }
      }

      return this.constructor.render({ interval, downloads })
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

const downloadServices = ['plugin', 'theme'].map(DownloadsForExtensionType)
const installServices = ['plugin', 'theme'].map(InstallsForExtensionType)
const modules = [...downloadServices, ...installServices]
module.exports = modules
