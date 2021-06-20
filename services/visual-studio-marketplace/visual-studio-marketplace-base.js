import Joi from 'joi'
import validate from '../../core/base-service/validate.js'
import { BaseJsonService, NotFound } from '../index.js'

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
                    version: Joi.string().required(),
                  })
                )
                .min(1)
                .required(),
              releaseDate: Joi.string().required(),
              lastUpdated: Joi.string().required(),
            })
          )
          .required(),
      })
    )
    .required(),
}).required()

const statisticSchema = Joi.object().keys({
  install: Joi.number().default(0),
  updateCount: Joi.number().default(0),
  onpremDownloads: Joi.number().default(0),
  averagerating: Joi.number().default(0),
  ratingcount: Joi.number().default(0),
})

export default class VisualStudioMarketplaceBase extends BaseJsonService {
  static keywords = [
    'vscode',
    'tfs',
    'vsts',
    'visual-studio-marketplace',
    'vs-marketplace',
    'vscode-marketplace',
  ]

  static defaultBadgeData = {
    label: 'vs marketplace',
    color: 'blue',
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

    const value = validate({ ErrorClass: Error }, statistics, statisticSchema)

    return { statistics: value }
  }
}
