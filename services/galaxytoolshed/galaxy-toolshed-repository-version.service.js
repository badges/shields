import GalaxyToolshedBaseVersion from './galaxy-toolshed-base-version.js'

export class GalaxyToolshedRepositoryVersion extends GalaxyToolshedBaseVersion {
  static category = 'version'
  static route = {
    base: 'galaxy-toolshed/repository/v',
    pattern: ':repository/:owner',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Repository',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
      },
      staticPreview: this.render({
        label: 'sra_tools',
        version: '1.2.5',
      }),
    },
  ]

  static transform({ response }) {
    const data = this.filterRepositoryRevisionInstallInfo({
      response,
    })
    return data.changeset_revision
  }

  async handle({ repository, owner }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repository,
      owner,
      schema: this.constructor.repositoryRevisionInstallInfoSchema,
    })
    const version = this.constructor.transform({
      response,
    })
    return this.constructor.render({
      label: repository,
      version,
    })
  }
}
