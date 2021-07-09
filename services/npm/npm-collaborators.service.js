import { renderContributorBadge } from '../contributor-count.js'
import NpmBase from './npm-base.js'

const keywords = ['node']

export default class NpmCollaborators extends NpmBase {
  static category = 'activity'

  static route = this.buildRoute('npm/collaborators', { withTag: false })

  static examples = [
    {
      title: 'npm collaborators',
      pattern: ':packageName',
      namedParams: { packageName: 'prettier' },
      staticPreview: this.render({ collaborators: 6 }),
      keywords,
    },
    {
      title: 'npm collaborators',
      pattern: ':packageName',
      namedParams: { packageName: 'prettier' },
      queryParams: { registry_uri: 'https://registry.npmjs.com' },
      staticPreview: this.render({ collaborators: 6 }),
      keywords,
    },
  ]

  static defaultBadgeData = {
    label: 'npm collaborators',
  }

  static render({ collaborators }) {
    return renderContributorBadge({ contributorCount: collaborators })
  }

  async handle(namedParams, queryParams) {
    const { scope, packageName, registryUrl } = this.constructor.unpackParams(
      namedParams,
      queryParams
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
