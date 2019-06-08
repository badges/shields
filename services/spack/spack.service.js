'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('..//version')
const { BaseJsonService } = require('..')
const schema = Joi.object({
  latest_version: Joi.string().required(),
}).required()

module.exports = class SpackVersion extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'spack/v',
      pattern: ':packageName',
    }
  }

  static get examples() {
    return [
      {
        title: 'Spack',
        namedParams: { packageName: 'adios2' },
        staticPreview: this.render({ version: '2.3.1' }),
        keywords: ['hpc'],
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'spack' }
  }

  static render({ version }) {
    return renderVersionBadge({ version })
  }

  async fetch({ packageName }) {
    const firstLetter = packageName[0]
    return this._requestJson({
      schema,
      url: `https://packages.spack.io/api/${firstLetter}/${packageName}.json`,
      errorMessages: {
        404: 'package not found',
      },
    })
  }

  async handle({ packageName }) {
    const pkg = await this.fetch({ packageName })
    return this.constructor.render({ version: pkg['latest_version'] })
  }
}
