'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService, NotFound } = require('..')

const schema = Joi.object({
  entries: Joi.array()
    .items(
      Joi.object({
        source_package_version: Joi.string().required(),
      })
    )
    .required(),
}).required()

module.exports = class Ubuntu extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'ubuntu/v',
      pattern: ':series?/:packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Ubuntu package',
        namedParams: { series: 'bionic', packageName: 'ubuntu-wallpapers' },
        staticPreview: renderVersionBadge({ version: '18.04.1-0ubuntu1' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'ubuntu' }
  }

  async fetch({ series, packageName }) {
    const seriesParam = series
      ? {
          distro_series: `https://api.launchpad.net/1.0/ubuntu/${encodeURIComponent(
            series
          )}`,
        }
      : {}
    return this._requestJson({
      schema,
      url: 'https://api.launchpad.net/1.0/ubuntu/+archive/primary',
      options: {
        qs: {
          'ws.op': 'getPublishedSources',
          exact_match: 'true',
          order_by_date: 'true',
          status: 'Published',
          source_name: packageName,
          ...seriesParam,
        },
      },
      errorMessages: {
        400: 'series not found',
      },
    })
  }

  async handle({ series, packageName }) {
    const data = await this.fetch({ series, packageName })
    if (!data.entries.length) {
      throw new NotFound()
    }
    return renderVersionBadge({
      version: data.entries[0].source_package_version,
    })
  }
}
