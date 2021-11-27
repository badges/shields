import semver from 'semver'
import { getCachedResource } from '../../core/base-service/resource-cache.js'

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

async function getOfferedVersions() {
  return getCachedResource({
    url: 'https://api.wordpress.org/core/version-check/1.7/',
    scraper: json => json.offers.map(v => v.version),
  })
}

function toSemver(v) {
  const parts = v.split('-')
  if (parts.length > 2) {
    return v
  }
  const version = parts[0]
  const suffix = parts[1] ? parts[1] : ''
  if (version.split('.').length === 2) {
    return suffix !== '' ? `${version}.0-${suffix}` : `${version}.0`
  } else {
    return v
  }
}

async function versionColorForWordpressVersion(version) {
  const offeredVersions = await getOfferedVersions()

  const latestVersion = toSemver(offeredVersions[0])
  version = toSemver(version)
  if (!semver.valid(latestVersion)) return 'lightgrey'
  if (!semver.valid(version)) return 'lightgrey'

  if (version === latestVersion || semver.gtr(version, latestVersion)) {
    return 'brightgreen'
  } else if (offeredVersions.includes(version)) {
    return 'orange'
  } else {
    return 'yellow'
  }
}

export { toSemver, getOfferedVersions, versionColorForWordpressVersion }
