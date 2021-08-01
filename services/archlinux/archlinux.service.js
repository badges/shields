import Joi from 'joi'
import { renderVersionBadge } from '../version.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  pkgver: Joi.string().required(),
}).required()

export default class ArchLinux extends BaseJsonService {
  static category = 'version'
  static route = {
    base: 'archlinux/v',
    pattern: ':repository/:architecture/:packageName',
  }

  static examples = [
    {
      title: 'Arch Linux package',
      namedParams: {
        architecture: 'x86_64',
        repository: 'core',
        packageName: 'pacman',
      },
      staticPreview: renderVersionBadge({ version: '5.1.3' }),
    },
  ]

  static defaultBadgeData = { label: 'arch linux' }

  async handle({ repository, architecture, packageName }) {
    const data = await this._requestJson({
      schema,
      url: `https://www.archlinux.org/packages/${encodeURIComponent(
        repository
      )}/${encodeURIComponent(architecture)}/${encodeURIComponent(
        packageName
      )}/json/`,
    })
    return renderVersionBadge({ version: data.pkgver })
  }
}
