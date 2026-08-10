import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'

const metaSchema = Joi.object()
  .keys({
    current_version: Joi.string().required(),
    requires_cp: Joi.string().allow('').required(),
    requires_php: Joi.string().allow('').required(),
  })
  .required()

const schema = Joi.array()
  .items(
    Joi.object().keys({
      meta: metaSchema,
    }),
  )
  .required()

export const description = `
These badges use the [ClassicPress Directory API](https://docs.classicpress.net/developer-guides/classicpress-directory-api/),
which is documented for public developer use. The directory does not publish
rate limits, so these badges cache for longer than the default
platform-support duration and request only the \`meta\` fields they need, to
keep load on the upstream API low.
`

export class BaseClassicpress extends BaseJsonService {
  // requires_cp / requires_php only change on plugin or theme releases.
  // Default platform-support cache is 300s; use 1h while rate limits are
  // undocumented (similar rationale to crates.io badges).
  static _cacheLength = 3600

  async fetch({ extensionType, slug }) {
    const json = await this._requestJson({
      url: `https://directory.classicpress.net/wp-json/wp/v2/${extensionType}s/`,
      schema,
      options: {
        searchParams: { byslug: slug, _fields: 'meta' },
      },
    })
    if (json.length === 0) {
      throw new NotFound()
    }
    return json[0].meta
  }
}
