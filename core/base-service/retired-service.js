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

function retiredService(attrs) {
  const { route, name, label, category, issueUrl } = Joi.attempt(
    attrs,
    attrSchema,
    `Retired service for ${attrs.route.base}`,
  )

  return class RetiredService extends BaseService {
    static name = name
      ? `Retired${name}`
      : `Retired${camelcase(route.base.replace(/\//g, '_'), {
          pascalCase: true,
        })}`

    static category = category
    static isRetired = true
    static route = route
    static _cacheLength = 86400
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
        message: 'retired badge',
      }
    }
  }
}

export default retiredService
