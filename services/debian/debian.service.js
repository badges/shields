'use strict'

const Joi = require('@hapi/joi')
const { latest, renderVersionBadge } = require('../version')
const { BaseJsonService, NotFound } = require('..')

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
    for (const resultdist of Object.keys(data[0][packageName])) {
      const versions = Object.keys(data[0][packageName][resultdist])
      return renderVersionBadge({ version: latest(versions) })
    }
    throw new NotFound()
  }
}
