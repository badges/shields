import { InvalidResponse } from '../index.js'

export function parseVersionFromVcpkgManifest(manifest) {
  if (manifest['version-date']) {
    return manifest['version-date']
  }
  if (manifest['version-semver']) {
    return manifest['version-semver']
  }
  if (manifest['version-string']) {
    return manifest['version-string']
  }
  if (manifest.version) {
    return manifest.version
  }
  throw new InvalidResponse({ prettyMessage: 'missing version' })
}
