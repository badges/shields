import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  latest: Joi.string().required(),
}).required()

export default class JsrVersion extends BaseJsonService {
  static category = 'version'

  static route = {
    base: 'jsr/v',
    pattern: ':scope(@[^/]+)/:packageName',
  }

  static openApi = {
    '/jsr/v/{scope}/{packageName}': {
      get: {
        summary: 'JSR Version',
        description:
          '[JSR](https://jsr.io/) is a modern package registry for JavaScript and TypeScript.',
        parameters: pathParams(
          {
            name: 'scope',
            example: '@luca',
          },
          {
            name: 'packageName',
            example: 'flag',
          },
        ),
      },
    },
  }

  static defaultBadgeData = {
    label: 'jsr',
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ scope, packageName }) {
    // see https://jsr.io/docs/api#package-version-metadata
    return this._requestJson({
      schema,
      url: `https://jsr.io/${scope}/${packageName}/meta.json`,
      httpErrors: {
        404: 'package not found',
      },
    })
  }

  async handle({ scope, packageName }) {
    const { latest } = await this.fetch({ scope, packageName })
    return this.constructor.render({ version: latest })
  }
}
