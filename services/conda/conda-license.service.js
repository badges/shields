import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import toArray from '../../core/base-service/to-array.js'
import BaseCondaService from './conda-base.js'

const schema = Joi.object({
  license: Joi.string().required(),
}).required()

export default class CondaLicense extends BaseCondaService {
  static category = 'license'
  static route = { base: 'conda', pattern: 'l/:channel/:pkg' }

  static examples = [
    {
      title: 'Conda - License',
      pattern: 'l/:channel/:package',
      namedParams: {
        channel: 'conda-forge',
        package: 'setuptools',
      },
      staticPreview: this.render({
        variant: 'l',
        channel: 'conda-forge',
        licenses: ['MIT'],
      }),
    },
  ]

  static defaultBadgeData = { label: 'license' }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ channel, pkg }) {
    const json = await this._requestJson({
      schema,
      url: `https://api.anaconda.org/package/${channel}/${pkg}`,
    })
    return this.constructor.render({
      licenses: toArray(json.license),
    })
  }
}
