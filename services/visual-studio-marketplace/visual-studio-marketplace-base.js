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
                  }),
                )
                .default([]),
              versions: Joi.array()
                .items(
                  Joi.object({
                    version: Joi.string().required(),
                    properties: Joi.array()
                      .items(
                        Joi.object({
                          key: Joi.string().required(),
                          value: Joi.any().required(),
                        }),
                      )
                      .default([]),
                  }),
                )
                .min(1)
                .required(),
              releaseDate: Joi.string().required(),
              lastUpdated: Joi.string().required(),
            }),
          )
          .required(),
      }),
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
      // Microsoft does not provide a clear API doc. It seems that the flag value is calculated
      // as the combined hex values of the requested flags, converted to base 10.
      // This was found using the vscode repo at:
      // https://github.com/microsoft/vscode/blob/main/src/vs/platform/extensionManagement/common/extensionGalleryService.ts
      // This flag value is 0x192.
      flags: 402,
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
      httpErrors: {
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
