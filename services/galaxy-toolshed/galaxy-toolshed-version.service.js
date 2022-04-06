import Joi from 'joi'
import { addv as versionText } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import { NotFound } from '../index.js'
import BaseGalaxyToolshedService from './galaxy-toolshed-base.js'

const repositoryRevisionInstallInfoSchema = Joi.array().items(
  Joi.object({}),
  Joi.object({
    changeset_revision: Joi.string().required(),
    valid_tools: Joi.array()
      .items(
        Joi.object({
          requirements: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().required(),
                version: Joi.string().required(),
              }).required()
            )
            .required(),
          id: Joi.string().required(),
          name: Joi.string().required(),
          version: Joi.string().required(),
        }).required()
      )
      .required(),
  }).required(),
  Joi.object({})
)

export default class GalaxyToolshedVersion extends BaseGalaxyToolshedService {
  static category = 'version'
  static route = {
    base: 'galaxy-toolshed/v',
    pattern: ':repositoryName/:owner/:toolId?/:requirementName?',
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Repository',
      namedParams: {
        repositoryName: 'sra_tools',
        owner: 'iuc',
      },
      staticPreview: this.render({
        label: 'sra_tools',
        version: '1.2.5',
      }),
    },
    {
      title: 'Galaxy Toolshed - Tool',
      namedParams: {
        repositoryName: 'sra_tools',
        owner: 'iuc',
        toolId: 'fastq_dump',
      },
      staticPreview: this.render({
        label: 'Extract reads',
        version: '1.2.5',
      }),
    },
    {
      title: 'Galaxy Toolshed - Requirement',
      namedParams: {
        repositoryName: 'sra_tools',
        owner: 'iuc',
        toolId: 'fastq_dump',
        requirementName: 'perl',
      },
      queryParams: { display: 'repositoryName' },
      staticPreview: this.render({
        display: 'repositoryName',
        label: `perl`,
        version: '5.18.1',
      }),
    },
  ]

  static render({ label, version }) {
    return {
      label,
      message: versionText(version),
      color: versionColor(version),
    }
  }

  static transform({ response, repositoryName, toolId, requirementName }) {
    const data = this.filterRepositoryRevisionInstallInfo({
      response,
    })

    // Repository version
    if (toolId === null && requirementName === null) {
      return { label: repositoryName, version: data.changeset_revision }
    }
    // Tool version
    const tool = data.valid_tools
      .filter(function (tool) {
        return tool.id === toolId
      })
      .shift()

    if (typeof tool === 'undefined') {
      throw new NotFound({ prettyMessage: 'tool not found' })
    }
    if (requirementName === null) {
      return { label: tool.name, version: tool.version }
    }
    // Requirement version
    const versions = data.valid_tools.reduce(function (
      previousValue,
      currentValue
    ) {
      return currentValue.requirements.reduce(function (prev, curr) {
        if (requirementName === curr.name) {
          return [...prev, curr.version]
        }
        return [...prev]
      }, [])
    },
    [])
    if (typeof versions === 'undefined' || !versions.length) {
      throw new NotFound({ prettyMessage: 'requirement not found' })
    }
    return { label: requirementName, version: versions.shift() }
  }

  async handle({
    repositoryName,
    owner,
    toolId = null,
    requirementName = null,
  }) {
    const response = await this.fetchLastOrderedInstallableRevisionsSchema({
      repositoryName,
      owner,
      schema: repositoryRevisionInstallInfoSchema,
    })
    const data = this.constructor.transform({
      response,
      repositoryName,
      toolId,
      requirementName,
    })
    return this.constructor.render({
      label: data.label,
      version: data.version,
    })
  }
}
