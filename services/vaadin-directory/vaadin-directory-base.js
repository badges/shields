import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  ratingCount: nonNegativeInteger,
  averageRating: Joi.number().min(0).required(),
  latestAvailableRelease: Joi.object({
    publicationDate: Joi.date().required(),
    name: Joi.string().required(),
  }).required(),
  status: Joi.string().required(),
}).required()

class BaseVaadinDirectoryService extends BaseJsonService {
  async fetch({ packageName }) {
    return this._requestJson({
      schema,
      url: `https://vaadin.com/vaadincom/directory-service/components/search/findByUrlIdentifier`,
      options: {
        searchParams: {
          projection: 'summary',
          urlIdentifier: packageName,
        },
      },
    })
  }
}

export { BaseVaadinDirectoryService }
