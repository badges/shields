import Joi from 'joi'
import { addv as versionText } from '../text-formatters.js'
import { version as versionColor } from '../color-formatters.js'
import { NotFound } from '../index.js'
import BaseGalaxyToolshedService from './galaxy-toolshed-base.js'

const queryParamSchema = Joi.object({
  display: Joi.string()
    .valid('default', 'reponame', 'toolid', 'toolname')
    .default('default'),
  requirement: Joi.string().default('all'),
}).required()

export default class GalaxyToolshedVersion extends BaseGalaxyToolshedService {
  static category = 'version'
  static route = {
    base: 'galaxy-toolshed',
    pattern: ':variant(v|vr)/:reponame/:owner/:toolid',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Galaxy Toolshed - Repository',
      namedParams: {
        variant: 'v',
        reponame: 'sra_tools',
        owner: 'iuc',
        toolid: 'fastq_dump',
      },
      staticPreview: this.render({
        display: 'default',
        label: 'toolshed',
        version: '1.2.5',
      }),
    },
    {
      title: 'Galaxy Toolshed - Requirement',
      namedParams: {
        variant: 'vr',
        reponame: 'sra_tools',
        owner: 'iuc',
        toolid: 'fastq_dump',
      },
      queryParams: { display: 'reponame', requirement: 'perl' },
      staticPreview: this.render({
        display: 'reponame',
        label: 'toolshed|sra_tools',
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

  async fetch({ reponame, owner }) {
    const changesetRevisions =
      await this.fetchOrderedInstallableRevisionsSchema({ reponame, owner })
    return this.fetchRepositoryRevisionInstallInfoSchema({
      reponame,
      owner,
      changesetRevision: changesetRevisions.shift(),
    })
  }

  static transform(response, variant, reponame, toolid, display, requirement) {
    // Parse response
    const metadata = response
      .filter(function (x) {
        return Object.keys(x).length > 0
      })
      .shift()
    const tool = metadata.valid_tools
      .filter(function (tool) {
        return tool.id === toolid
      })
      .shift()

    if (typeof tool === 'undefined') {
      throw new NotFound({ prettyMessage: 'tool not found' })
    }

    // Version
    let version = tool.version
    if (variant === 'vr') {
      version = metadata.valid_tools.reduce(function (
        previousValue,
        currentValue
      ) {
        return currentValue.requirements.reduce(function (prev, curr) {
          const req = `[${curr.name} - ${curr.version}]`
          if (requirement === 'all' || requirement === curr.name) {
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
      case 'reponame':
        label = reponame
        break
      case 'toolid':
        label = toolid
        break
      case 'toolname':
        label = tool.name
        break
      default:
        break
    }
    return { label, version }
  }

  async handle({ variant, reponame, owner, toolid }, { display, requirement }) {
    const response = await this.fetch({ reponame, owner })
    const data = this.constructor.transform(
      response,
      variant,
      reponame,
      toolid,
      display,
      requirement
    )
    return this.constructor.render({
      display,
      label: data.label,
      version: data.version,
    })
  }
}
