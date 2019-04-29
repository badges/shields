'use strict'

const Joi = require('joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  pkgver: Joi.string().required(),
}).required()

module.exports = class ArchLinux extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'archlinux/v',
      pattern: ':repository/:architecture/:packageName',
    }
  }

  static get examples() {
    return [
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
  }

  static get defaultBadgeData() {
    return { label: 'arch linux' }
  }

  async handle({ repository, architecture, packageName }) {
    const data = await this._requestJson({
      schema,
      url: `https://www.archlinux.org/packages/${repository}/${architecture}/${packageName}/json/`,
    })
    return renderVersionBadge({ version: data.pkgver })
  }
}
