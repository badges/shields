import Joi from 'joi'
import { BaseStaticService } from '../index.js'

const queryParamSchema = Joi.object({
  message: Joi.string().required(),
}).required()

export default class QueryStringStaticBadge extends BaseStaticService {
  static category = 'static'

  static route = {
    base: '',
    pattern: 'static/:schemaVersion(v1)',
    // All but one of the parameters are parsed via coalesceBadge. This
    // reuses what is the override behaviour for other badges.
    queryParamSchema,
  }

  handle(namedParams, queryParams) {
    return { message: queryParams.message }
  }
}
