'use strict'

const moment = require('moment')
const { InvalidResponse } = require('..')
const { formatDate } = require('../text-formatters')
const { age: ageColor } = require('../color-formatters')
const BaseWordpress = require('./wordpress-base')

const extensionData = {
  plugin: {
    capt: 'Plugin',
    exampleSlug: 'bbpress',
    lastUpdateFormat: 'YYYY-MM-DD hh:mma GMT',
  },
  theme: {
    capt: 'Theme',
    exampleSlug: 'twentyseventeen',
    lastUpdateFormat: 'YYYY-MM-DD',
  },
}

function LastUpdateForType(extensionType) {
  const { capt, exampleSlug, lastUpdateFormat } = extensionData[extensionType]

  return class WordpressLastUpdate extends BaseWordpress {
    static name = `Wordpress${capt}LastUpdated`

    static category = 'activity'

    static route = {
      base: `wordpress/${extensionType}/last-updated`,
      pattern: ':slug',
    }

    static examples = [
      {
        title: `WordPress ${capt} Last Updated`,
        namedParams: { slug: exampleSlug },
        staticPreview: this.render({ last_updated: '2020-08-11' }),
      },
    ]

    static defaultBadgeData = { label: 'last updated' }

    static render({ last_updated }) {
      return {
        label: 'last updated',
        message: formatDate(last_updated),
        color: ageColor(last_updated),
      }
    }

    transform(lastUpdate) {
      const date = moment(lastUpdate, lastUpdateFormat)

      if (date.isValid()) {
        return date.format('YYYY-MM-DD')
      } else {
        throw new InvalidResponse({ prettyMessage: 'invalid date' })
      }
    }

    async handle({ slug }) {
      const { last_updated } = await this.fetch({
        extensionType,
        slug,
      })

      const newDate = await this.transform(last_updated)

      return this.constructor.render({
        last_updated: newDate,
      })
    }
  }
}

const lastupdate = ['plugin', 'theme'].map(LastUpdateForType)
module.exports = [...lastupdate]
