import { NotFound } from '../index.js'
import GalaxyToolshedBaseVersion from './galaxy-toolshed-base-version.js'

export class GalaxyToolshedRequirementVersion extends GalaxyToolshedBaseVersion {
  static category = 'version'
  static route = {
    base: 'galaxy-toolshed/requirement/v',
    pattern: ':repository/:owner/:tool/:requirement',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Requirement',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
        tool: 'fastq_dump',
        requirement: 'perl',
      },
      staticPreview: this.render({
        label: 'perl',
        version: '5.18.1',
      }),
    },
  ]

  static transform({ response, tool, requirement }) {
    const data = this.filterRepositoryRevisionInstallInfo({
      response,
    })
    // Tool
    const dataTool = data.valid_tools
      .filter(function (x) {
        return x.id === tool
      })
      .shift()
    if (typeof dataTool === 'undefined') {
      throw new NotFound({ prettyMessage: 'tool not found' })
    }
    // Requirement version
    const versions = dataTool.requirements.reduce(function (prev, curr) {
      if (requirement === curr.name) {
        return [...prev, curr.version]
      }
      return [...prev]
    }, [])
    if (typeof versions === 'undefined' || !versions.length) {
      throw new NotFound({ prettyMessage: 'requirement not found' })
    }
    return versions.shift()
  }

  async handle({ repository, owner, tool, requirement }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repository,
      owner,
      schema: this.constructor.repositoryRevisionInstallInfoSchema,
    })
    const version = this.constructor.transform({
      response,
      repository,
      tool,
      requirement,
    })
    return this.constructor.render({
      label: requirement,
      version,
    })
  }
}
