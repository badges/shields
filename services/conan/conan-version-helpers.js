import yaml from 'js-yaml'
import { NotFound, InvalidResponse } from '../index.js'

function versionToList(version) {
  return version
    .split('+', 1)[0]
    .split(/[.-]/)
    .map(v => (!isNaN(+v) ? +v : v))
}
// Sorting logic adapted from:
// https://github.com/conan-io/conan/blob/0e22f9e84bb2953ef48de8e32decc5a1a3613fb1/conans/model/version.py#L131
export function compareVersions(v1, v2) {
  const list1 = versionToList(v1)
  const list2 = versionToList(v2)
  let equal = true
  for (let i = 0; i < Math.max(list1.length, list2.length); i++) {
    if ((list1[i] ?? 0) !== (list2[i] ?? 0)) {
      equal = false
      break
    }
  }
  if (equal) {
    const build1 = v1.split('+', 2)[1] ?? ''
    const build2 = v2.split('+', 2)[1] ?? ''
    if (build1 === build2) {
      return 0
    } else if (build1 > build2) {
      return -1
    } else {
      return 1
    }
  }
  for (let i = 0; i < list1.length; i++) {
    const el1 = list1[i]
    if (i >= list2.length) {
      return typeof el1 === 'number' ? 1 : -1
    }
    const el2 = list2[i]
    if (typeof el1 !== 'number' && typeof el2 === 'number') {
      return 1
    } else if (el1 === el2) {
      continue
    } else if (el1 > el2) {
      return 1
    } else {
      return -1
    }
  }
  if (list2.length > list1.length) {
    return -1
  }
}

export function parseLatestVersionFromConfig(configYaml) {
  let versions
  try {
    const config = yaml.load(configYaml)
    versions = Object.keys(config.versions)
  } catch (err) {
    throw new InvalidResponse({
      prettyMessage: 'invalid config.yml',
      underlyingError: err,
    })
  }
  versions.sort(compareVersions)

  if (versions.length === 0) {
    throw new NotFound({ prettyMessage: 'no versions found' })
  }
  return versions[versions.length - 1]
}
