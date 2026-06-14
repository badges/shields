import yaml from 'js-yaml'
import { renderDateBadge } from '../date.js'
import { pathParam, InvalidResponse } from '../index.js'
import WingetBase from './winget-base.js'

export default class WingetReleaseDate extends WingetBase {
  static category = 'activity'

  static route = {
    base: 'winget',
    pattern: 'release-date/:name',
  }

  static openApi = {
    '/winget/release-date/{name}': {
      get: {
        summary: 'WinGet Package Release Date',
        description: 'WinGet Community Repository',
        parameters: [
          pathParam({
            name: 'name',
            example: 'Microsoft.WSL',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'release date',
  }

  async handle({ name }) {
    const version = await this.getLatestVersion({ name })
    const manifestPath = this.constructor.manifestPathFor({ name, version })
    const filesToTry = [`${name}.installer.yaml`, `${name}.yaml`]

    let releaseDate
    for (const file of filesToTry) {
      const json = await this.fetchManifest({
        expression: `HEAD:${manifestPath}/${file}`,
      })
      const text = json.data.repository.object?.text
      if (!text) continue
      const manifest = yaml.load(text)
      if (manifest?.ReleaseDate) {
        releaseDate = manifest.ReleaseDate
        break
      }
    }

    if (!releaseDate) {
      throw new InvalidResponse({ prettyMessage: 'no release date found' })
    }

    return renderDateBadge(releaseDate)
  }
}
