'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { metric } = require('../../lib/text-formatters')
const {
  downloadCount: downloadCountColor,
} = require('../../lib/color-formatters')
const { nonNegativeInteger } = require('../validators')

const schema = Joi.object({
  downloads: Joi.object({
    total: nonNegativeInteger,
    monthly: nonNegativeInteger,
    weekly: nonNegativeInteger,
    daily: nonNegativeInteger,
  }).required(),
})

function DownloadsForInterval(interval) {
  const { base, messageSuffix } = {
    daily: {
      base: 'dub/dd',
      messageSuffix: '/day',
    },
    weekly: {
      base: 'dub/dw',
      messageSuffix: '/week',
    },
    monthly: {
      base: 'dub/dm',
      messageSuffix: '/month',
    },
    total: {
      base: 'dub/dt',
      messageSuffix: '',
    },
  }[interval]

  return class DubDownloads extends BaseJsonService {
    static render({ downloads, version }) {
      const label = version ? `downloads@${version}` : 'downloads'
      return {
        label,
        message: `${metric(downloads)}${messageSuffix}`,
        color: downloadCountColor(downloads),
      }
    }

    async fetch({ packageName, version }) {
      let url = `https://code.dlang.org/api/packages/${packageName}`
      if (version) {
        url += `/${version}`
      }
      url += '/stats'
      return this._requestJson({ schema, url })
    }

    async handle({ packageName, version }) {
      const data = await this.fetch({ packageName, version })
      return this.constructor.render({
        downloads: data.downloads[interval],
        version,
      })
    }

    static get defaultBadgeData() {
      return { label: 'downloads' }
    }

    static get category() {
      return 'downloads'
    }

    static get route() {
      return {
        base,
        pattern: ':packageName/:version*',
      }
    }

    static get examples() {
      let examples = [
        {
          title: 'DUB',
          pattern: ':packageName',
          namedParams: { packageName: 'vibe-d' },
          staticPreview: this.render({ downloads: 5000 }),
        },
      ]
      if (interval === 'monthly') {
        examples = examples.concat([
          {
            title: 'DUB (version)',
            pattern: ':packageName/:version',
            namedParams: { packageName: 'vibe-d', version: '0.8.4' },
            staticPreview: this.render({ downloads: 100, version: '0.8.4' }),
          },
          {
            title: 'DUB (latest)',
            pattern: ':packageName/:version',
            namedParams: { packageName: 'vibe-d', version: 'latest' },
            staticPreview: this.render({ downloads: 100, version: 'latest' }),
          },
        ])
      }
      return examples
    }
  }
}

module.exports = ['daily', 'weekly', 'monthly', 'total'].map(
  DownloadsForInterval
)
