'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')

const extensionQuerySchema = Joi.object({
  results: Joi.array()
    .items(
      Joi.object({
        extensions: Joi.array()
          .items(
            Joi.object({
              statistics: Joi.array()
                .items(
                  Joi.object({
                    statisticName: Joi.string().required(),
                    value: Joi.number().required(),
                  })
                )
                .required(),
              versions: Joi.array()
                .items(
                  Joi.object({
                    version: Joi.string().regex(/^(\d+\.\d+\.\d+)(\.\d+)?$/),
                  })
                )
                .min(1)
                .required(),
            })
          )
          .required(),
      })
    )
    .required(),
}).required()

module.exports = class VsMarketplaceBase extends BaseJsonService {
  static get keywords() {
    return [
      'vscode',
      'visual studio',
      'azure devops',
      'vs-marketplace',
      'vscode-marketplace',
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'vs marketplace',
      color: 'blue',
    }
  }

  async fetch({ extensionId }) {
    const url =
      'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery/'
    const body = {
      filters: [
        {
          criteria: [{ filterType: 7, value: extensionId }],
        },
      ],
      flags: 914,
    }
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json;api-version=3.0-preview.1',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    }

    return this._requestJson({
      schema: extensionQuerySchema,
      url,
      options,
      errorMessages: {
        400: 'invalid extension id',
      },
    })
  }

  transformExtension({ json }) {
    const extensions = json.results[0].extensions
    if (extensions.length === 0) {
      throw new NotFound({ prettyMessage: 'extension not found' })
    }
    return { extension: extensions[0] }
  }

  transformStatistics({ json }) {
    const { extension } = this.transformExtension({ json })
    return { statistics: extension.statistics }
  }

  getStatistic({ statistics, statisticName }) {
    for (const statistic of statistics) {
      if (statistic.statisticName === statisticName) {
        return { value: statistic.value }
      }
    }

    return { value: 0 }
  }
}
