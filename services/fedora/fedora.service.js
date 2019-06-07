'use strict'

const Joi = require('@hapi/joi')
const { renderVersionBadge } = require('../version')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  version: Joi.string().required(),
}).required()

// No way to permalink to current "stable", https://pagure.io/mdapi/issue/69
const defaultBranch = 'rawhide'

module.exports = class Fedora extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'fedora/v',
      pattern: ':packageName/:branch?',
    }
  }

  static get examples() {
    return [
      {
        title: 'Fedora package',
        namedParams: { packageName: 'rpm', branch: 'rawhide' },
        staticPreview: renderVersionBadge({ version: '4.14.2.1' }),
        documentation:
          'See <a href="https://apps.fedoraproject.org/mdapi/">mdapi docs</a> for information on valid branches.',
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'fedora' }
  }

  async handle({ packageName, branch = defaultBranch }) {
    const data = await this._requestJson({
      schema,
      url: `https://apps.fedoraproject.org/mdapi/${encodeURIComponent(
        branch
      )}/pkg/${encodeURIComponent(packageName)}`,
      errorMessages: {
        400: 'branch not found',
      },
    })
    return renderVersionBadge({ version: data.version })
  }
}
