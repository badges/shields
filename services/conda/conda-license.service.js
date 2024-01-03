import Joi from 'joi'
import { pathParams } from '../index.js'
import { renderLicenseBadge } from '../licenses.js'
import toArray from '../../core/base-service/to-array.js'
import BaseCondaService from './conda-base.js'

const schema = Joi.object({
  license: Joi.string().required(),
}).required()

export default class CondaLicense extends BaseCondaService {
  static category = 'license'
  static route = { base: 'conda', pattern: 'l/:channel/:packageName' }

  static openApi = {
    '/conda/l/{channel}/{packageName}': {
      get: {
        summary: 'Conda - License',
        parameters: pathParams(
          {
            name: 'channel',
            example: 'conda-forge',
          },
          {
            name: 'packageName',
            example: 'setuptools',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'license' }

  static render({ licenses }) {
    return renderLicenseBadge({ licenses })
  }

  async handle({ channel, packageName }) {
    const json = await this._requestJson({
      schema,
      url: `https://api.anaconda.org/package/${channel}/${packageName}`,
    })
    return this.constructor.render({
      licenses: toArray(json.license),
    })
  }
}
