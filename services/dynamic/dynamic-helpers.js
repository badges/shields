import Joi from 'joi'
import { optionalUrl } from '../validators.js'

const queryParamSchema = Joi.object({
  url: optionalUrl.required(),
  query: Joi.string().required(),
  prefix: Joi.alternatives().try(Joi.string(), Joi.number()),
  suffix: Joi.alternatives().try(Joi.string(), Joi.number()),
})
  .rename('uri', 'url', { ignoreUndefined: true, override: true })
  .required()

function createRoute(which) {
  return {
    base: `badge/dynamic/${which}`,
    pattern: '',
    queryParamSchema,
  }
}

export { createRoute }
