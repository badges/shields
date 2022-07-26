import { NotFound } from '../index.js'
import { renderVersionBadge } from '../version.js'
import GalaxyToolshedService from './galaxytoolshed-base.js'

export class GalaxyToolshedVersion extends GalaxyToolshedService {
  static category = 'version'
  static route = {
    base: 'galaxytoolshed/v',
    pattern: ':repository/:owner/:tool?/:requirement?',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed (repository)',
      pattern: ':repository/:owner',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
      },
      staticPreview: renderVersionBadge({ version: '1.2.5' }),
    },
    {
      title: 'Galaxy Toolshed (tool)',
      pattern: ':repository/:owner/:tool',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
        tool: 'fastq_dump',
      },
      staticPreview: renderVersionBadge({ version: '1.2.5' }),
    },
    {
      title: 'Galaxy Toolshed (requirement)',
      pattern: ':repository/:owner/:tool/:requirement',
      namedParams: {
        repository: 'sra_tools',
        owner: 'iuc',
        tool: 'fastq_dump',
        requirement: 'perl',
      },
      staticPreview: renderVersionBadge({ version: '5.18.1' }),
    },
  ]

  static transform({ response, tool, requirement }) {
    if (tool !== undefined) {
      const dataTool = response[1].valid_tools.filter(function (x) {
        return x.id === tool
      })[0]
      if (typeof dataTool === 'undefined') {
        throw new NotFound({ prettyMessage: 'tool not found' })
      }
      // Requirement version
      if (requirement !== undefined) {
        const versions = dataTool.requirements.reduce(function (prev, curr) {
          if (requirement === curr.name) {
            return [...prev, curr.version]
          }
          return [...prev]
        }, [])
        if (typeof versions === 'undefined' || !versions.length) {
          throw new NotFound({ prettyMessage: 'requirement not found' })
        }
        return versions[0]
      }
      // Tool version
      return dataTool.version
    }
    // Repository version
    return response[1].changeset_revision
  }

  async handle({ repository, owner, tool, requirement }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repository,
      owner,
    })
    const version = this.constructor.transform({
      response,
      tool,
      requirement,
    })
    return renderVersionBadge({ version })
  }
}
