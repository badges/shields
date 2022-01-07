import Joi from 'joi'
import { BaseJsonService, NotFound, InvalidResponse } from '../index.js'
import { renderVersionBadge } from '../version.js'
import { parseReference, compareReferences } from './conan-version-helpers.js'

const schema = Joi.object({
  results: Joi.array().items(Joi.string()),
}).required()

export default class ConanVersion extends BaseJsonService {
  static category = 'version'

  static route = { base: 'conan/v', pattern: ':packageName' }

  static examples = [
    {
      title: 'Conan Center',
      namedParams: { packageName: 'boost' },
      staticPreview: this.render({ version: '1.78.0' }),
      keywords: ['c++'],
    },
  ]

  static defaultBadgeData = { label: 'conan' }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async handle({ packageName }) {
    const { results: rawResults } = await this._requestJson({
      schema,
      url: `https://center.conan.io/v1/conans/search?q=${encodeURIComponent(
        packageName
      )}`,
    })

    if (!rawResults) {
      throw new InvalidResponse()
    }
    const results = rawResults
      .map(raw => {
        const ref = parseReference(raw)
        if (!ref) {
          throw new InvalidResponse({
            underlyingError: new Error(`Unable to parse reference: '${raw}'`),
          })
        }
        if (ref.name === packageName) {
          return ref
        }
        return undefined
      })
      .filter(Boolean)
      .sort(compareReferences)

    if (results.length === 0) {
      throw new NotFound()
    }

    const ref = results[results.length - 1]
    return this.constructor.render({ version: ref.version })
  }
}
