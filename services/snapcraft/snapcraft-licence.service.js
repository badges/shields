import Joi from 'joi'
import { renderLicenseBadge } from '../licenses.js'
import SnapcraftBase, { snapcraftPackageParam } from './snapcraft-base.js'

const licenseSchema = Joi.object({
  snap: Joi.object({
    license: Joi.string().required(),
  }).required(),
}).required()

export default class SnapcraftLicense extends SnapcraftBase {
  static category = 'license'

  static route = {
    base: 'snapcraft/l',
    pattern: ':package',
  }

  static openApi = {
    '/snapcraft/l/{package}': {
      get: {
        summary: 'Snapcraft License',
        parameters: [snapcraftPackageParam],
      },
    },
  }

  static render({ license }) {
    return renderLicenseBadge({ license })
  }

  static transform(apiData) {
    return apiData.snap.license
  }

  async handle({ package: packageName }) {
    const parsedData = await this.fetch(licenseSchema, { packageName })
    const license = this.constructor.transform(parsedData)
    return this.constructor.render({ license })
  }
}
