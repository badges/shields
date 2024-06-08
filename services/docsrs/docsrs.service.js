import Joi from 'joi'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  doc_status: Joi.boolean().required(),
}).required()

export default class DocsRs extends BaseJsonService {
  static category = 'build'
  static route = { base: 'docsrs', pattern: ':crate/:version?' }
  static openApi = {
    '/docsrs/{crate}/{version}': {
      get: {
        summary: 'docs.rs (with version)',
        parameters: pathParams(
          {
            name: 'crate',
            example: 'regex',
          },
          {
            name: 'version',
            example: 'latest',
          },
        ),
      },
    },
    '/docsrs/{crate}': {
      get: {
        summary: 'docs.rs',
        parameters: pathParams({
          name: 'crate',
          example: 'regex',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'docs' }

  static render({ docStatus, version }) {
    let label = `docs@${version}`
    if (version === 'latest') {
      label = 'docs'
    }
    if (docStatus) {
      return {
        label,
        message: 'passing',
        color: 'success',
      }
    } else {
      return {
        label,
        message: 'failing',
        color: 'critical',
      }
    }
  }

  async fetch({ crate, version }) {
    return await this._requestJson({
      schema,
      url: `https://docs.rs/crate/${crate}/${version}/status.json`,
      httpErrors: version ? { 400: 'malformed version' } : {},
    })
  }

  async handle({ crate, version = 'latest' }) {
    const { doc_status: docStatus } = await this.fetch({ crate, version })
    return this.constructor.render({ version, docStatus })
  }
}
