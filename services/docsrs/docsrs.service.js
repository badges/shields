import Joi from 'joi'
import { BaseJsonService } from '../index.js'

const schema = Joi.array()
  .items(
    Joi.object({
      build_status: Joi.boolean().required(),
    })
  )
  .min(1)
  .required()

export default class DocsRs extends BaseJsonService {
  static category = 'build'
  static route = { base: 'docsrs', pattern: ':crate/:version?' }
  static examples = [
    {
      title: 'docs.rs',
      namedParams: { crate: 'regex', version: 'latest' },
      staticPreview: this.render({ version: 'latest', buildStatus: true }),
      keywords: ['rust'],
    },
  ]

  static defaultBadgeData = { label: 'docs' }

  static render({ buildStatus, version }) {
    let label = `docs@${version}`
    if (version === 'latest') {
      label = 'docs'
    }
    if (buildStatus) {
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
      url: `https://docs.rs/crate/${crate}/${version}/builds.json`,
    })
  }

  async handle({ crate, version = 'latest' }) {
    const [{ build_status: buildStatus }] = await this.fetch({ crate, version })
    return this.constructor.render({ version, buildStatus })
  }
}
