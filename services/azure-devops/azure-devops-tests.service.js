'use strict'

const Joi = require('joi')
const BaseAzureDevOpsService = require('./azure-devops-base')
const { getHeaders } = require('./azure-devops-helpers')
const { renderTestResultBadge } = require('../../lib/text-formatters')

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
  <code>https://img.shields.io/azure-devops/tests/ORGANIZATION/PROJECT/DEFINITION_ID.svg</code>.
</p>
<p>
  Optionally, you can specify a named branch:
  <code>https://img.shields.io/azure-devops/tests/ORGANIZATION/PROJECT/DEFINITION_ID/NAMED_BRANCH.svg</code>.
</p>
<p>
  You may change the "passed", "failed" and "skipped" text on this badge by supplying query parameters <code>&passed_label=</code>, <code>&failed_label=</code> and <code>&skipped_label=</code> respectively.
  <br>
  There is also a <code>&compact_message</code> query parameter, which will default to displaying ✔, ✘ and ➟, separated by a horizontal bar |.
  <br>
  For example, if you want to use a different terminology:
  <br>
  <code>/azure-devops/tests/ORGANIZATION/PROJECT/DEFINITION_ID.svg?passed_label=good&failed_label=bad&skipped_label=n%2Fa</code>
  <br>
  Or, use symbols:
  <br>
  <code>/azure-devops/tests/ORGANIZATION/PROJECT/DEFINITION_ID.svg?compact_message&passed_label=%F0%9F%8E%89&failed_label=%F0%9F%92%A2&skipped_label=%F0%9F%A4%B7</code>
</p>
`

const buildTestResultSummarySchema = Joi.object({
  aggregatedResultsAnalysis: Joi.object({
    totalTests: Joi.number().required(),
    resultsByOutcome: Joi.object({
      Passed: Joi.object({
        count: Joi.number().required(),
      }).optional(),
      Failed: Joi.object({
        count: Joi.number().required(),
      }).optional(),
      Skipped: Joi.object({
        count: Joi.number().required(),
      }).optional(),
    }).required(),
  }).required(),
}).required()

module.exports = class AzureDevOpsTests extends BaseAzureDevOpsService {
  static render({
    passed,
    failed,
    skipped,
    total,
    passedLabel,
    failedLabel,
    skippedLabel,
    isCompact,
  }) {
    return renderTestResultBadge({
      passed,
      failed,
      skipped,
      total,
      passedLabel,
      failedLabel,
      skippedLabel,
      isCompact,
    })
  }

  static get defaultBadgeData() {
    return { label: 'tests' }
  }

  static get category() {
    return 'build'
  }

  static get examples() {
    return [
      {
        title: 'Azure DevOps tests',
        pattern: ':organization/:project/:definitionId',
        namedParams: {
          organization: 'azuredevops-powershell',
          project: 'azuredevops-powershell',
          definitionId: '1',
        },
        staticExample: this.render({
          passed: 20,
          failed: 1,
          skipped: 1,
          total: 22,
        }),
        keywords: ['vso', 'vsts', 'azure-devops'],
        documentation,
      },
      {
        title: 'Azure DevOps tests (branch)',
        pattern: ':organization/:project/:definitionId/:branch',
        namedParams: {
          organization: 'azuredevops-powershell',
          project: 'azuredevops-powershell',
          definitionId: '1',
          branch: 'master',
        },
        staticExample: this.render({
          passed: 20,
          failed: 1,
          skipped: 1,
          total: 22,
        }),
        keywords: ['vso', 'vsts', 'azure-devops'],
        documentation,
      },
      {
        title: 'Azure DevOps tests (compact)',
        pattern: ':organization/:project/:definitionId',
        namedParams: {
          organization: 'azuredevops-powershell',
          project: 'azuredevops-powershell',
          definitionId: '1',
        },
        queryParams: {
          compact_message: null,
        },
        keywords: ['vso', 'vsts', 'azure-devops'],
        staticExample: this.render({
          passed: 20,
          failed: 1,
          skipped: 1,
          total: 22,
          isCompact: true,
        }),
        documentation,
      },
      {
        title: 'Azure DevOps tests with custom labels',
        pattern: ':organization/:project/:definitionId',
        namedParams: {
          organization: 'azuredevops-powershell',
          project: 'azuredevops-powershell',
          definitionId: '1',
        },
        keywords: ['vso', 'vsts', 'azure-devops'],
        queryParams: {
          passed_label: 'good',
          failed_label: 'bad',
          skipped_label: 'n/a',
        },
        staticExample: this.render({
          passed: 20,
          failed: 1,
          skipped: 1,
          total: 22,
          passedLabel: 'good',
          failedLabel: 'bad',
          skippedLabel: 'n/a',
        }),
        documentation,
      },
    ]
  }

  static get route() {
    return {
      base: 'azure-devops/tests',
      format: '([^/]+)/([^/]+)/([^/]+)(?:/(.+))?',
      capture: ['organization', 'project', 'definitionId', 'branch'],
      queryParams: [
        'compact_message',
        'passed_label',
        'failed_label',
        'skipped_label',
      ],
    }
  }

  async handle(
    { organization, project, definitionId, branch },
    {
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    }
  ) {
    const headers = getHeaders()
    const errorMessages = {
      404: 'build pipeline or test result summary not found',
    }
    const buildId = await this.getLatestBuildId(
      organization,
      project,
      definitionId,
      branch,
      headers,
      errorMessages
    )

    // https://dev.azure.com/azuredevops-powershell/azuredevops-powershell/_apis/test/ResultSummaryByBuild?buildId=20
    const url = `https://dev.azure.com/${organization}/${project}/_apis/test/ResultSummaryByBuild`
    const options = {
      qs: {
        buildId,
      },
      headers,
    }

    const json = await this.fetch({
      url,
      options,
      schema: buildTestResultSummarySchema,
      errorMessages,
    })

    const total = json.aggregatedResultsAnalysis.totalTests

    let passed = 0
    const passedTests = json.aggregatedResultsAnalysis.resultsByOutcome.Passed
    if (passedTests) {
      passed = passedTests.count
    }

    let failed = 0
    const failedTests = json.aggregatedResultsAnalysis.resultsByOutcome.Failed
    if (failedTests) {
      failed = failedTests.count
    }

    // assume the rest has been skipped
    const skipped = total - passed - failed
    const isCompact = compactMessage !== undefined
    return this.constructor.render({
      passed,
      failed,
      skipped,
      total,
      passedLabel,
      failedLabel,
      skippedLabel,
      isCompact,
    })
  }
}
