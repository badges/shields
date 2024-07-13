import { pathParam, queryParam } from '../index.js'
import { renderContributorBadge } from '../contributor-count.js'
import NpmBase, { packageNameDescription } from './npm-base.js'

export default class NpmCollaborators extends NpmBase {
  static category = 'activity'

  static route = this.buildRoute('npm/collaborators', { withTag: false })

  static openApi = {
    '/npm/collaborators/{packageName}': {
      get: {
        summary: 'NPM Collaborators',
        parameters: [
          pathParam({
            name: 'packageName',
            example: 'prettier',
            description: packageNameDescription,
          }),
          queryParam({
            name: 'registry_uri',
            example: 'https://registry.npmjs.com',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'npm collaborators',
  }

  static render({ collaborators }) {
    return renderContributorBadge({ contributorCount: collaborators })
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams,
    )
    const { maintainers } = await this.fetchPackageData({
      scope,
      packageName,
      registryUrl,
    })
    const collaborators = maintainers.length
    return this.constructor.render({ collaborators })
  }
}
