import Joi from 'joi'
import { metric } from '../text-formatters.js'
import { colorScale } from '../color-formatters.js'
import { nonNegativeInteger } from '../validators.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  npatrons: nonNegativeInteger,
  giving: Joi.object()
    .keys({
      amount: Joi.string().required(),
      currency: Joi.string().required(),
    })
    .allow(null)
    .required(),
  receiving: Joi.object()
    .keys({
      amount: Joi.string().required(),
      currency: Joi.string().required(),
    })
    .allow(null)
    .required(),
  goal: Joi.object()
    .keys({
      amount: Joi.string().required(),
    })
    .allow(null),
}).required()

const isCurrencyOverTime = Joi.string().regex(
  /^([0-9]*[1-9][0-9]*(\.[0-9]+)?|[0]+\.[0-9]*[1-9][0-9]*)[ A-Za-z]{4}\/week/
)

function renderCurrencyBadge({ label, amount, currency }) {
  return {
    label,
    message: `${metric(amount)} ${currency}/week`,
    color: colorScale([0, 10, 100])(amount),
  }
}

class LiberapayBase extends BaseJsonService {
  static category = 'funding'

  static defaultBadgeData = {
    label: 'liberapay',
    namedLogo: 'liberapay',
  }

  async fetch({ entity }) {
    return this._requestJson({
      schema,
      url: `https://liberapay.com/${entity}/public.json`,
    })
  }

  static buildRoute(badgeName) {
    return {
      base: `liberapay/${badgeName}`,
      pattern: ':entity',
    }
  }
}

export { renderCurrencyBadge, LiberapayBase, isCurrencyOverTime }
