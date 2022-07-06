import yaml from 'js-yaml'
import { NotFound, InvalidResponse } from '../index.js'

export function parseReleaseVersionFromDistro(configYaml, packageName) {
  let packageInfo
  try {
    const config = yaml.load(configYaml)
    packageInfo = config.repositories[packageName]
  } catch (err) {
    throw new InvalidResponse({
      prettyMessage: 'invalid distribution.yml',
      underlyingError: err,
    })
  }

  if (!packageInfo) {
    throw new NotFound({ prettyMessage: `package not found: ${packageName}` })
  }

  const version = packageInfo.release?.version
  if (typeof version !== 'string') {
    throw new NotFound({
      prettyMessage: `unable to determine version for ${packageName}`,
    })
  }

  // Strip off "release inc" suffix
  return version.replace(/-\d+$/, '')
}
