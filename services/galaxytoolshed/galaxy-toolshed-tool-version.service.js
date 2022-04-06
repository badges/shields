import { NotFound } from '../index.js'
import GalaxyToolshedBaseVersion from './galaxy-toolshed-base-version.js'

export class GalaxyToolshedToolVersion extends GalaxyToolshedBaseVersion {
  static category = 'version'
  static route = {
    base: 'galaxy-toolshed/tool/v',
    pattern: ':repository/:owner/:tool',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Tool',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
        tool: 'fastq_dump',
      },
      staticPreview: this.render({
        label: 'fastq_dump',
        version: '1.2.5',
      }),
    },
  ]

  static transform({ response, tool }) {
    const data = this.filterRepositoryRevisionInstallInfo({
      response,
    })
    const dataTool = data.valid_tools
      .filter(function (x) {
        return x.id === tool
      })
      .shift()

    if (typeof dataTool === 'undefined') {
      throw new NotFound({ prettyMessage: 'tool not found' })
    }
    return dataTool.version
  }

  async handle({ repository, owner, tool }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repository,
      owner,
      schema: this.constructor.repositoryRevisionInstallInfoSchema,
    })
    const version = this.constructor.transform({
      response,
      repository,
      tool,
    })
    return this.constructor.render({
      label: tool,
      version,
    })
  }
}
