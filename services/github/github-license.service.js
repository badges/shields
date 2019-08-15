'use strict'

const Joi = require('@hapi/joi')
const { renderLicenseBadge } = require('../licenses')
const { GithubAuthV3Service } = require('./github-auth-service')
const { documentation, errorMessagesFor } = require('./github-helpers')

const schema = Joi.object({
  // Some repos do not have a license, in which case GitHub returns `{ license: null }`.
  license: Joi.object({ spdx_id: Joi.string().required() }).allow(null),
}).required()

module.exports = class GithubLicense extends GithubAuthV3Service {
  static get category() {
    return 'license'
  }

  static get route() {
    return {
      base: 'github/license',
      pattern: ':user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub',
        namedParams: { user: 'mashape', repo: 'apistatus' },
        staticPreview: {
          label: 'license',
          message: 'MIT',
          color: 'green',
        },
        keywords: ['license'],
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'license',
    }
  }

  static render({ license }) {
    if (license === 'NOASSERTION') {
      return { message: 'not identifiable by github' }
    } else if (license) {
      return renderLicenseBadge({ license })
    } else {
      return { message: 'not specified' }
    }
  }

  async handle({ user, repo }) {
    const { license: licenseObject } = await this._requestJson({
      schema,
      url: `/repos/${user}/${repo}`,
      errorMessages: errorMessagesFor('repo not found'),
    })

    const license = licenseObject ? licenseObject.spdx_id : undefined
    return this.constructor.render({ license })
  }
}
