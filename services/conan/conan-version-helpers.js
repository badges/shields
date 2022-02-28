import yaml from 'js-yaml'
import { NotFound, InvalidResponse } from '../index.js'
import { latest } from '../version.js'

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
  const version = latest(versions)
  if (version == null) {
    throw new NotFound({ prettyMessage: 'no versions found' })
  }
  return version
}
