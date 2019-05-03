'use strict'

const { promisify } = require('util')
const semver = require('semver')
const { regularUpdate } = require('../../core/legacy/regular-update')

// TODO: Incorporate this schema.
// const schema = Joi.object()
//   .keys({
//     offers: Joi.array()
//       .items(
//         Joi.object()
//           .keys({
//             version: Joi.string()
//               .regex(/^\d+(\.\d+)?(\.\d+)?$/)
//               .required(),
//           })
//           .required()
//       )
//       .required(),
//   })
//   .required()

function getOfferedVersions() {
  return promisify(regularUpdate)({
    url: 'https://api.wordpress.org/core/version-check/1.7/',
    intervalMillis: 24 * 3600 * 1000,
    json: true,
    scraper: json => json.offers.map(v => v.version),
  })
}

function toSemver(version) {
  if (version.split('.').length === 2) {
    return `${version}.0`
  } else {
    return version
  }
}

async function versionColorForWordpressVersion(version) {
  const offeredVersions = await getOfferedVersions()

  const latestVersion = toSemver(offeredVersions[0])
  version = toSemver(version)

  if (version === latestVersion || semver.gtr(version, latestVersion)) {
    return 'brightgreen'
  } else if (offeredVersions.includes(version)) {
    return 'orange'
  } else {
    return 'yellow'
  }
}

module.exports = {
  getOfferedVersions,
  versionColorForWordpressVersion,
}
