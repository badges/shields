import Joi from 'joi'
import { optionalNonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const extensionQuerySchema = Joi.object({
  error: Joi.string(),
  version: Joi.string().required(),
  timestamp: Joi.string().isoDate().required(),
  downloadCount: optionalNonNegativeInteger,
  reviewCount: optionalNonNegativeInteger,
  averageRating: Joi.number().when('reviewCount', {
    is: Joi.exist(),
    then: Joi.number().max(5),
    otherwise: Joi.optional(),
  }),
}).required()

export default class OpenVSXBase extends BaseJsonService {
  static keywords = [
    'ovsx',
    'open-vsx',
    'ovsx-marketplace',
    'open-vsx-marketplace',
  ]

  static defaultBadgeData = {
    label: 'open vsx',
    color: 'blue',
  }

  async fetch({ namespace, extension, version }) {
    return this._requestJson({
      schema: extensionQuerySchema,
      url: `https://open-vsx.org/api/${namespace}/${extension}/${
        version || ''
      }`,
      errorMessages: {
        400: 'invalid extension id',
        404: 'extension not found',
      },
    })
  }
}
