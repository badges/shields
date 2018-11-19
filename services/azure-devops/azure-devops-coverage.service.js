'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')
const { getHeaders } = require('./azure-devops-helpers')

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
        pattern: ':organization/:project/:definitionId',
        staticExample: this.render({ coverage: 100 }),
        exampleUrl: 'swellaby/opensource/25',
        keywords: ['vso', 'vsts', 'azure-devops'],
        documentation,
      },
      {
        title: 'Azure DevOps coverage (branch)',
        pattern: ':organization/:project/:definitionId/:branch',
        staticExample: this.render({ coverage: 100 }),
        exampleUrl: 'swellaby/opensource/25/master',
        keywords: ['vso', 'vsts', 'azure-devops'],
        documentation,
      },
    ]
  }

  static get route() {
    return {
      base: 'azure-devops/coverage',
      format: '([^/]+)/([^/]+)/([^/]+)(?:/(.+))?',
      capture: ['organization', 'project', 'definitionId', 'branch'],
    }
  }

  async fetch({ url, options, schema }) {
    return this._requestJson({
      schema,
      url,
      options,
      errorMessages: {
        404: 'build pipeline or coverage not found',
      },
    })
  }

  async getLatestBuildId(organization, project, definitionId, branch, headers) {
    // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/azure/devops/build/builds/list?view=azure-devops-rest-5.0
    const url = `https://dev.azure.com/${organization}/${project}/_apis/build/builds`
    const options = {
      qs: {
        definitions: definitionId,
        $top: 1,
        'api-version': '5.0-preview.4',
      },
      headers,
    }
    if (branch) {
      options.qs.branch = branch
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
    const headers = getHeaders()
    const buildId = await this.getLatestBuildId(
      organization,
      project,
      definitionId,
      branch,
      headers
    )
    // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/azure/devops/test/code%20coverage/get%20build%20code%20coverage?view=azure-devops-rest-5.0
    const url = `https://dev.azure.com/${organization}/${project}/_apis/test/codecoverage`
    const options = {
      qs: {
        buildId,
        'api-version': '5.0-preview.1',
      },
      headers,
    }
    const json = await this.fetch({
      url,
      options,
      schema: buildCodeCoverageSchema,
    })

    let covered = 0
    let total = 0
    json.coverageData.forEach(cd => {
      cd.coverageStats.forEach(coverageStat => {
        if (coverageStat.label === 'Line' || coverageStat.label === 'Lines') {
          covered += coverageStat.covered
          total += coverageStat.total
        }
      })
    })
    const coverage = covered ? (covered / total) * 100 : 0
    return this.constructor.render({ coverage })
  }
}
