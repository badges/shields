import Joi from 'joi'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const description =
  '[Terraform Registry](https://registry.terraform.io) is an interactive resource for discovering a wide selection of integrations (providers), configuration packages (modules), and security rules (policies) for use with Terraform.'

const schema = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      month: nonNegativeInteger,
      total: nonNegativeInteger,
      week: nonNegativeInteger,
      year: nonNegativeInteger,
    }).required(),
  }),
})

const intervalMap = {
  dw: {
    transform: json => json.data.attributes.week,
    interval: 'week',
  },
  dm: {
    transform: json => json.data.attributes.month,
    interval: 'month',
  },
  dy: {
    transform: json => json.data.attributes.year,
    interval: 'year',
  },
  dt: {
    transform: json => json.data.attributes.total,
    interval: '',
  },
}

class BaseTerraformService extends BaseJsonService {
  static _cacheLength = 3600

  async fetch({ kind, object }) {
    const url = `https://registry.terraform.io/v2/${kind}/${object}/downloads/summary`
    return this._requestJson({
      schema,
      url,
    })
  }
}

export { BaseTerraformService, intervalMap, description }
