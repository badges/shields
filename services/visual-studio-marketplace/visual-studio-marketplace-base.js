'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')

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

module.exports = class VisualStudioMarketplaceBase extends BaseJsonService {
  static get keywords() {
    return [
      'vscode',
      'visual studio',
      'azure devops',
      'tfs',
      'vsts',
      'visual-studio-marketplace',
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
    const statistics = {}

    extension.statistics.forEach(({ statisticName, value }) => {
      statistics[statisticName] = value
    })

    statistics.install = statistics.install ? statistics.install : 0
    statistics.updateCount = statistics.updateCount ? statistics.updateCount : 0
    statistics.onpremDownloads = statistics.onpremDownloads
      ? statistics.onpremDownloads
      : 0
    statistics.averagerating = statistics.averagerating
      ? statistics.averagerating
      : 0
    statistics.ratingcount = statistics.ratingcount ? statistics.ratingcount : 0

    return { statistics }
  }

  // getStatistic({ statistics, statisticName }) {
  //   for (const statistic of statistics) {
  //     if (statistic.statisticName === statisticName) {
  //       return { value: statistic.value }
  //     }
  //   }

  //   return { value: 0 }
  // }
}
