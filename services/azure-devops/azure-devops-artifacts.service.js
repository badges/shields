'use strict'

const { fetchPackage, getLatestVersion } = require('../nuget/nuget-v3-helpers')
const { renderVersionBadge } = require('../nuget/nuget-helpers')
const { BaseJsonService } = require('..')
const { NotFound } = require('..')

class AzureArtifactsNugetVersionService extends BaseJsonService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'azure-devops',
      pattern:
        ':which(v|vpre)/:organization/:project/:feed/:view(all|local|prerelease|release)?/:packageName',
    }
  }

  static get examples() {
    return []
  }

  static get defaultBadgeData() {
    return {
      label: 'nuget',
    }
  }

  static render(props) {
    return renderVersionBadge(props)
  }

  async handle({ which, organization, project, feed, view, packageName }) {
    function getViewName() {
      if (!view) return ''

      switch (view) {
        case 'all':
          return ''
        case 'local':
          return '%40Local'
        case 'prerelease':
          return '%40Prerelease'
        case 'release':
          return '%40Release'
        default:
          throw new NotFound({ prettyMessage: `invalid view name: ${view}` })
      }
    }

    const viewName = getViewName()
    const baseUrl = `https://pkgs.dev.azure.com/${organization}/${project}/_packaging/${feed}${viewName}/nuget/v3`
    const { versions } = await fetchPackage(this, { baseUrl, packageName })
    const { version } = getLatestVersion(versions, which === 'vpre')
    return this.constructor.render({ version })
  }
}

module.exports = { AzureArtifactsNugetVersionService }
