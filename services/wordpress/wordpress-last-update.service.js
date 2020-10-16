'use strict'

const { formatDate } = require('../text-formatters')
const { age: ageColor } = require('../color-formatters')
const BaseWordpress = require('./wordpress-base')

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

function LastUpdateForType(extensionType) {
  const { capt, exampleSlug } = extensionData[extensionType]

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

    transform(date, extensionType) {
      let d
      if (extensionType === 'plugin') {
        d = date.split(' ')
        d = d[0]
      } else {
        d = date
      }

      const ymd = d.split('-')

      const out = ymd[0] + ymd[1] + ymd[2]
      return out
    }

    async handle({ slug }) {
      const { last_updated } = await this.fetch({
        extensionType,
        slug,
      })

      const newDate = await this.transform(last_updated, extensionType)

      return this.constructor.render({
        last_updated: newDate,
      })
    }
  }
}

const lastupdate = ['plugin', 'theme'].map(LastUpdateForType)
module.exports = [...lastupdate]
