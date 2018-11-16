'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')
const { buildOptions } = require('./azure-devops-helpers')

const documentation = `
<p>
  To obtain your own badge, you need to get 3 pieces of information:
  <code>ORGANIZATION</code>, <code>PROJECT</code> and <code>DEFINITION_ID</code>.
</p>
<p>
  First, you need to select your build definition and look at the url:
</p>
<img
  src="https://user-images.githubusercontent.com/3749820/47259976-e2d9ec80-d4b2-11e8-92cc-7c81089a7a2c.png"
  alt="ORGANIZATION is after the dev.azure.com part, PROJECT is right after that, DEFINITION_ID is at the end after the id= part." />
<p>
  Your badge will then have the form:
  <code>https://img.shields.io/azure-devops/coverage/ORGANIZATION/PROJECT/DEFINITION_ID.svg</code>.
</p>
<p>
  Optionally, you can specify a named branch:
  <code>https://img.shields.io/azure-devops/coverage/ORGANIZATION/PROJECT/DEFINITION_ID/NAMED_BRANCH.svg</code>.
</p>
`
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

const latestBuildSchema = Joi.object({
  count: Joi.number().required(),
  value: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
      })
    )
    .required(),
}).required()

const buildCodeCoverageSchema = Joi.object({
  coverageData: Joi.array()
    .items(
      Joi.object({
        coverageStats: Joi.array()
          .items(
            Joi.object({
              label: Joi.string().required(),
              total: Joi.number().required(),
              covered: Joi.number().required(),
            })
          )
          .min(1)
          .required(),
      })
    )
    .required(),
}).required()

module.exports = class AzureDevOpsCoverage extends BaseJsonService {
  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentageColor(coverage),
    }
  }

  static get defaultBadgeData() {
    return { label: 'coverage' }
  }

  static get category() {
    return 'build'
  }

  static get examples() {
    return [
      {
        title: 'Azure DevOps coverage',
        urlPattern:
          'azure-devops/coverage/:organization/:project/:definitionId',
        staticExample: this.render({ coverage: 100 }),
        exampleUrl: 'azure-devops/coverage/swellaby/opensource/25',
        keywords: ['vso', 'vsts', 'azure-devops'],
        documentation,
      },
      {
        title: 'Azure DevOps coverage (branch)',
        urlPattern:
          'azure-devops/coverage/:organization/:project/:definitionId/:branch',
        staticExample: this.render({ coverage: 100 }),
        exampleUrl: 'azure-devops/coverage/swellaby/opensource/25/master',
        keywords: ['vso', 'vsts', 'azure-devops'],
        documentation,
      },
    ]
  }

  static get route() {
    return {
      base: '',
      format: '(?:azure-devops|vso)/coverage/([^/]+)/([^/]+)/([^/]+)(?:/(.+))?',
      capture: ['organization', 'project', 'definitionId', 'branch'],
    }
  }

  async fetch({ url, options, schema }) {
    return this._requestJson({
      url,
      options,
      schema,
      errorMessages: {
        404: 'build pipeline or coverage not found',
      },
    })
  }

  async getLatestBuildId(organization, project, definitionId, branch, options) {
    let url = `https://dev.azure.com/${organization}/${project}/_apis/build/builds?definitions=${definitionId}&$top=1&api-version=5.0-preview.4`
    if (branch) {
      url += `&branch=${branch}`
    }
    const json = await this.fetch({
      url,
      options,
      schema: latestBuildSchema,
    })

    if (json.count !== 1) {
      throw new NotFound({ prettyMessage: 'build pipeline not found' })
    }

    return json.value[0].id
  }

  async handle({ organization, project, definitionId, branch }) {
    const options = buildOptions()
    const buildId = await this.getLatestBuildId(
      organization,
      project,
      definitionId,
      branch,
      options
    )
    const url = `https://dev.azure.com/${organization}/${project}/_apis/test/codecoverage?buildId=${buildId}&api-version=5.0-preview.1`

    const json = await this.fetch({
      url,
      options,
      schema: buildCodeCoverageSchema,
    })

    let covered = 0
    let total = 0
    json.coverageData.forEach(cd => {
      cd.coverageStats.forEach(coverageStat => {
        if (coverageStat.label === 'Lines') {
          covered += coverageStat.covered
          total += coverageStat.total
        }
      })
    })
    const coverage = covered ? (covered / total) * 100 : 0
    return this.constructor.render({ coverage })
  }
}
