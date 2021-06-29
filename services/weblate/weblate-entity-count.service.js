'use strict'

const Joi = require('joi')
const camelcase = require('camelcase')
const { BaseJsonService } = require('..')
const { nonNegativeInteger, optionalUrl } = require('../validators')
const { metric } = require('../text-formatters')

const schema = Joi.object({
  count: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl.required(),
}).required()

class WeblateEntityCountBase extends BaseJsonService {
  static category = 'other'

  static buildRoute(entityName) {
    return {
      base: 'weblate',
      pattern: entityName,
      queryParamSchema,
    }
  }

  static defaultBadgeData = { label: 'weblate', color: 'brightgreen' }

  async fetch({ entityName, server }) {
    return this._requestJson({
      schema,
      url: `${server}/api/${entityName}/`,
      errorMessages: {
        403: 'access denied',
        429: 'rate limited by remote server',
      },
    })
  }
}

function WeblateEntityCountFactory({ entityName, exampleValue }) {
  return class WeblateEntityCountService extends WeblateEntityCountBase {
    static name = camelcase(`Weblate ${entityName}`, { pascalCase: true })
    static route = this.buildRoute(entityName)

    static examples = [
      {
        title: `Weblate ${entityName}`,
        namedParams: {},
        queryParams: { server: 'https://hosted.weblate.org' },
        staticPreview: this.render({ count: exampleValue }),
        documentation: `<p>This badge displays the number of ${entityName} on a Weblate instance.</p>`,
        keywords: ['i18n', 'internationalization'],
      },
    ]

    static render({ count }) {
      return { message: `${metric(count)} ${entityName}` }
    }

    async handle(routeParams, { server }) {
      const { count } = await this.fetch({ entityName, server })
      return this.constructor.render({ count })
    }
  }
}

const entityCounts = [
  { entityName: 'components', exampleValue: 2799 },
  { entityName: 'languages', exampleValue: 384 },
  { entityName: 'projects', exampleValue: 533 },
  { entityName: 'units', exampleValue: 16539728 },
  { entityName: 'users', exampleValue: 33058 },
].map(WeblateEntityCountFactory)

module.exports = [...entityCounts]
