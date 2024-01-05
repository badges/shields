import { NotFound, pathParams } from '../index.js'
import { renderVersionBadge } from '../version.js'
import GalaxyToolshedService from './galaxytoolshed-base.js'

export class GalaxyToolshedVersion extends GalaxyToolshedService {
  static category = 'version'
  static route = {
    base: 'galaxytoolshed/v',
    pattern: ':repository/:owner/:tool?/:requirement?',
  }

  static openApi = {
    '/galaxytoolshed/v/{repository}/{owner}': {
      get: {
        summary: 'Galaxy Toolshed - Repository Version',
        parameters: pathParams(
          {
            name: 'repository',
            example: 'sra_tools',
          },
          {
            name: 'owner',
            example: 'iuc',
          },
        ),
      },
    },
    '/galaxytoolshed/v/{repository}/{owner}/{tool}': {
      get: {
        summary: 'Galaxy Toolshed - Tool Version',
        parameters: pathParams(
          {
            name: 'repository',
            example: 'sra_tools',
          },
          {
            name: 'owner',
            example: 'iuc',
          },
          {
            name: 'tool',
            example: 'fastq_dump',
          },
        ),
      },
    },
    '/galaxytoolshed/v/{repository}/{owner}/{tool}/{requirement}': {
      get: {
        summary: 'Galaxy Toolshed - Tool Requirement Version',
        parameters: pathParams(
          {
            name: 'repository',
            example: 'sra_tools',
          },
          {
            name: 'owner',
            example: 'iuc',
          },
          {
            name: 'tool',
            example: 'fastq_dump',
          },
          {
            name: 'requirement',
            example: 'perl',
          },
        ),
      },
    },
  }

  static transform({ response, tool, requirement }) {
    if (tool !== undefined) {
      const dataTool = response[1].valid_tools.find(x => x.id === tool)
      if (dataTool === undefined) {
        throw new NotFound({ prettyMessage: 'tool not found' })
      }
      // Requirement version
      if (requirement !== undefined) {
        const dataRequirement = dataTool.requirements.find(
          x => x.name === requirement,
        )
        if (dataRequirement === undefined) {
          throw new NotFound({ prettyMessage: 'requirement not found' })
        }
        return dataRequirement.version
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
