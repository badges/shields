import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService, pathParams } from '../index.js'

const schema = Joi.object({
  pkgver: Joi.string().required(),
}).required()

export default class ArchLinux extends BaseJsonService {
  static category = 'version'
  static route = {
    base: 'archlinux/v',
    pattern: ':repository/:architecture/:packageName',
  }

  static openApi = {
    '/archlinux/v/{repository}/{architecture}/{packageName}': {
      get: {
        summary: 'Arch Linux package',
        parameters: pathParams(
          {
            name: 'repository',
            example: 'core',
          },
          {
            name: 'architecture',
            example: 'x86_64',
          },
          {
            name: 'packageName',
            example: 'pacman',
          },
        ),
      },
    },
  }

  static defaultBadgeData = { label: 'arch linux' }

  async handle({ repository, architecture, packageName }) {
    const data = await this._requestJson({
      schema,
      url: `https://www.archlinux.org/packages/${encodeURIComponent(
        repository,
      )}/${encodeURIComponent(architecture)}/${encodeURIComponent(
        packageName,
      )}/json/`,
    })
    return renderVersionBadge({ version: data.pkgver })
  }
}
