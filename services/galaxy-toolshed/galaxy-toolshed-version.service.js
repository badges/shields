import Joi from 'joi'
import { addv as versionText } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import { NotFound } from '../index.js'
import BaseGalaxyToolshedService from './galaxy-toolshed-base.js'

const repositoryRevisionInstallInfoSchema = Joi.array().items(
  Joi.object({}),
  Joi.object({
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

const queryParamSchema = Joi.object({
  display: Joi.string()
    .valid('default', 'repositoryName', 'toolId', 'toolName')
    .default('default'),
  requirement: Joi.string().default('all'),
}).required()

const defaultRequirementName = 'defaultRequirementName'

export default class GalaxyToolshedVersion extends BaseGalaxyToolshedService {
  static category = 'version'
  static route = {
    base: 'galaxy-toolshed/v',
    pattern: ':repositoryName/:owner/:toolId/:requirementName?',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Repository',
      namedParams: {
        repositoryName: 'sra_tools',
        owner: 'iuc',
        toolId: 'fastq_dump',
      },
      staticPreview: this.render({
        display: 'default',
        label: `${super.defaultBadgeData.label}`,
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
        label: `${super.defaultBadgeData.label}|sra_tools`,
        version: '[perl - 5.18.1]',
      }),
    },
  ]

  static render({ display, label, version }) {
    return {
      label:
        display === 'default'
          ? super.defaultBadgeData.label
          : `${super.defaultBadgeData.label}|${label}`,
      message: versionText(version),
      color: versionColor(version),
    }
  }

  async fetch({ repositoryName, owner }) {
    const changesetRevisions =
      await this.fetchOrderedInstallableRevisionsSchema({
        repositoryName,
        owner,
      })
    return this.fetchRepositoryRevisionInstallInfoSchema({
      schema: repositoryRevisionInstallInfoSchema,
      repositoryName,
      owner,
      changesetRevision: changesetRevisions.shift(),
    })
  }

  static transform(response, repositoryName, toolId, requirementName, display) {
    // Parse response
    const metadata = response
      .filter(function (x) {
        return Object.keys(x).length > 0
      })
      .shift()
    const tool = metadata.valid_tools
      .filter(function (tool) {
        return tool.id === toolId
      })
      .shift()

    if (typeof tool === 'undefined') {
      throw new NotFound({ prettyMessage: 'tool not found' })
    }

    // Version
    let version = tool.version
    if (requirementName !== defaultRequirementName) {
      version = metadata.valid_tools.reduce(function (
        previousValue,
        currentValue
      ) {
        return currentValue.requirements.reduce(function (prev, curr) {
          const req = `[${curr.name} - ${curr.version}]`
          if (requirementName === 'all' || requirementName === curr.name) {
            return [...prev, req]
          }
          return [...prev]
        }, [])
      },
      [])
      if (typeof version === 'undefined' || !version.length) {
        throw new NotFound({ prettyMessage: 'requirement not found' })
      }
      version = version.join(', ')
    }

    // Label
    let label = ''
    switch (display) {
      case 'repositoryName':
        label = repositoryName
        break
      case 'toolId':
        label = toolId
        break
      case 'toolName':
        label = tool.name
        break
      default:
        break
    }
    return { label, version }
  }

  async handle(
    { repositoryName, owner, toolId, requirementName = defaultRequirementName },
    { display }
  ) {
    const response = await this.fetch({ repositoryName, owner })
    const data = this.constructor.transform(
      response,
      repositoryName,
      toolId,
      requirementName,
      display
    )
    return this.constructor.render({
      display,
      label: data.label,
      version: data.version,
    })
  }
}
