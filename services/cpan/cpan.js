import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  version: Joi.alternatives(Joi.string().required(), Joi.number().required()),
  license: Joi.array().items(Joi.string()).min(1).required(),
}).required()

const description =
  '[CPAN](https://www.cpan.org/) is a package registry for Perl'

export default class BaseCpanService extends BaseJsonService {
  static defaultBadgeData = { label: 'cpan' }

  async fetch({ packageName }) {
    const url = `https://fastapi.metacpan.org/v1/release/${packageName}`
    return this._requestJson({ schema, url })
  }
}

export { BaseCpanService, description }
