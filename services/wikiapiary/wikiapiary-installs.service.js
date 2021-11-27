import Joi from 'joi'
import { renderDownloadsBadge } from '../downloads.js'
import { BaseJsonService, NotFound } from '../index.js'

const documentation = `
  <p>
    The name of an extension is case-sensitive excluding the first character.
  </p>
  <p>
    For example, in the case of <code>ParserFunctions</code>, the following are
    valid:
    <ul>
      <li><code>ParserFunctions</code></li>
      <li><code>parserFunctions</code></li>
    </ul>

    However, the following are invalid:
    <ul>
      <li><code>parserfunctions</code></li>
      <li><code>Parserfunctions</code></li>
      <li><code>pARSERfUNCTIONS</code></li>
    </ul>
  </p>
`

const schema = Joi.object({
  query: Joi.object({
    results: Joi.alternatives([
      Joi.object()
        .required()
        .pattern(/^\w+:.+$/, {
          printouts: Joi.object({
            'Has website count': Joi.array()
              .required()
              .items(Joi.number().required()),
          }).required(),
        }),
      Joi.array().required(),
    ]).required(),
  }).required(),
}).required()

/**
 * This badge displays the total installations of a MediaWiki extensions, skins,
 * etc via Wikiapiary.
 *
 * {@link https://www.mediawiki.org/wiki/Manual:Extensions MediaWiki Extensions Manual}
 */
export default class WikiapiaryInstalls extends BaseJsonService {
  static category = 'downloads'
  static route = {
    base: 'wikiapiary',
    pattern: ':variant(extension|skin|farm|generator|host)/installs/:name',
  }

  static examples = [
    {
      title: 'Wikiapiary installs',
      namedParams: { variant: 'extension', name: 'ParserFunctions' },
      staticPreview: this.render({ usage: 11170 }),
      documentation,
      keywords: ['mediawiki'],
    },
  ]

  static defaultBadgeData = { label: 'installs', color: 'informational' }

  static render({ usage: downloads }) {
    return renderDownloadsBadge({
      downloads,
      colorOverride: 'informational',
    })
  }

  async fetch({ variant, name }) {
    return this._requestJson({
      schema,
      url: `https://wikiapiary.com/w/api.php`,
      options: {
        searchParams: {
          action: 'ask',
          query: `[[${variant}:${name}]]|?Has_website_count`,
          format: 'json',
        },
      },
    })
  }

  static transform({ results, variant, name }) {
    if (Array.isArray(results)) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    const keyLowerCase = `${variant}:${name.toLowerCase()}`
    const resultKey = Object.keys(results).find(
      key => keyLowerCase === key.toLowerCase()
    )

    if (resultKey === undefined)
      throw new NotFound({ prettyMessage: 'not found' })

    const [usage] = results[resultKey].printouts['Has website count']
    return { usage }
  }

  async handle({ variant, name }) {
    const {
      query: { results },
    } = await this.fetch({ variant, name })
    const { usage } = this.constructor.transform({ results, name, variant })
    return this.constructor.render({ usage })
  }
}
