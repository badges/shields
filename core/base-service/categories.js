import Joi from 'joi'
import categories from '../../services/categories.js'

const isRealCategory = Joi.equal(...categories.map(({ id }) => id)).required()

const isValidCategory = Joi.alternatives()
  .try(isRealCategory, Joi.equal('debug', 'dynamic', 'static').required())
  .required()

function assertValidCategory(category, message = undefined) {
  Joi.assert(category, isValidCategory, message)
}

export { isValidCategory, assertValidCategory }
