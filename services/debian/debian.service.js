'use strict'

const Joi = require('@hapi/joi')
const { latest, renderVersionBadge } = require('../version')
const { BaseJsonService, NotFound, InvalidResponse } = require('..')

const schema = Joi.array()
  .items(
    Joi.object().pattern(
      /./,
      Joi.object()
        .pattern(/./, Joi.object().pattern(/./, Joi.object()))
        .required()
    ) // Optional, missing means not found
  )
  .max(1)
  .required()

const defaultDistribution = 'stable'

module.exports = class Debian extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'debian/v',
      pattern: ':packageName/:distribution?',
    }
  }

  static get examples() {
    return [
      {
        title: 'Debian package',
        namedParams: { packageName: 'apt', distribution: 'unstable' },
        staticPreview: renderVersionBadge({ version: '1.8.0' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'debian' }
  }

  async handle({ packageName, distribution = defaultDistribution }) {
    const data = await this._requestJson({
      schema,
      url: 'https://api.ftp-master.debian.org/madison',
      options: {
        qs: {
          f: 'json',
          s: distribution,
          package: packageName,
        },
      },
    })
    if (!data.length) {
      throw new NotFound()
    }
    // Distribution can change compared to request, for example requesting
    // "stretch" may map to "stable" in results, so can't use value from
    // request as is. Just take the first one instead.
    const packageData = data[0][packageName]
    if (!packageData) {
      throw new InvalidResponse({ prettyMessage: 'invalid response data' })
    }
    const distKeys = Object.keys(packageData)
    if (!distKeys) {
      throw new NotFound()
    }
    const versions = Object.keys(packageData[distKeys[0]])
    return renderVersionBadge({ version: latest(versions) })
  }
}
