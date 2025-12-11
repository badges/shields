import Joi from 'joi'
import camelcase from 'camelcase'
import BaseService from './base.js'
import { isValidCategory } from './categories.js'
import { isValidRoute } from './route.js'

const attrSchema = Joi.object({
  route: isValidRoute,
  name: Joi.string(),
  label: Joi.string(),
  category: isValidCategory,
  dateAdded: Joi.date().required(),
  issueUrl: Joi.string().uri(),
}).required()

function deprecatedService(attrs) {
  const { route, name, label, category, issueUrl } = Joi.attempt(
    attrs,
    attrSchema,
    `Deprecated service for ${attrs.route.base}`,
  )

  return class DeprecatedService extends BaseService {
    static name = name
      ? `Deprecated${name}`
      : `Deprecated${camelcase(route.base.replace(/\//g, '_'), {
          pascalCase: true,
        })}`

    static category = category
    static isDeprecated = true
    static route = route
    static defaultBadgeData = {
      label,
      // When an issue URL is provided, render the badge in red to alert the user that an upgrade action is required.
      color: issueUrl ? 'red' : 'lightgray',
    }

    async handle() {
      if (issueUrl) {
        return {
          message: issueUrl,
          link: [issueUrl],
        }
      }
      return {
        message: 'no longer available',
      }
    }
  }
}

export default deprecatedService
