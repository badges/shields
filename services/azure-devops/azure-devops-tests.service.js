import Joi from 'joi'
import {
  testResultQueryParamSchema,
  renderTestResultBadge,
  documentation as commonDocumentation,
} from '../test-results.js'
import AzureDevOpsBase from './azure-devops-base.js'

const commonAttrs = {
  keywords: ['vso', 'vsts', 'azure-devops'],
  namedParams: {
    organization: 'azuredevops-powershell',
    project: 'azuredevops-powershell',
    definitionId: '1',
    branch: 'master',
  },
  queryParams: {
    passed_label: 'passed',
    failed_label: 'failed',
    skipped_label: 'skipped',
    compact_message: null,
  },
  documentation: `
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
${commonDocumentation}
`,
}

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

export default class AzureDevOpsTests extends AzureDevOpsBase {
  static category = 'test-results'
  static route = {
    base: 'azure-devops/tests',
    pattern: ':organization/:project/:definitionId/:branch*',
    queryParamSchema: testResultQueryParamSchema,
  }

  static examples = [
    {
      title: 'Azure DevOps tests',
      staticPreview: this.render({
        passed: 20,
        failed: 1,
        skipped: 1,
        total: 22,
      }),
      ...commonAttrs,
    },
    {
      title: 'Azure DevOps tests (compact)',
      staticPreview: this.render({
        passed: 20,
        failed: 1,
        skipped: 1,
        total: 22,
        isCompact: true,
      }),
      ...commonAttrs,
    },
    {
      title: 'Azure DevOps tests with custom labels',
      queryParams: {
        passed_label: 'good',
        failed_label: 'bad',
        skipped_label: 'n/a',
        compact_message: null,
      },
      staticPreview: this.render({
        passed: 20,
        failed: 1,
        skipped: 1,
        total: 22,
        passedLabel: 'good',
        failedLabel: 'bad',
        skippedLabel: 'n/a',
      }),
      ...commonAttrs,
    },
  ]

  static defaultBadgeData = { label: 'tests' }

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

  static transform({ aggregatedResultsAnalysis }) {
    const { totalTests: total, resultsByOutcome } = aggregatedResultsAnalysis
    const passed = resultsByOutcome.Passed ? resultsByOutcome.Passed.count : 0
    const failed = resultsByOutcome.Failed ? resultsByOutcome.Failed.count : 0
    // assume the rest has been skipped
    const skipped = total - passed - failed
    return { passed, failed, skipped, total }
  }

  async fetchTestResults({ organization, project, definitionId, branch }) {
    const errorMessages = {
      404: 'build pipeline or test result summary not found',
    }
    const buildId = await this.getLatestCompletedBuildId(
      organization,
      project,
      definitionId,
      branch,
      errorMessages
    )

    // https://dev.azure.com/azuredevops-powershell/azuredevops-powershell/_apis/test/ResultSummaryByBuild?buildId=20
    return await this.fetch({
      url: `https://dev.azure.com/${organization}/${project}/_apis/test/ResultSummaryByBuild`,
      options: {
        searchParams: { buildId },
      },
      schema: buildTestResultSummarySchema,
      errorMessages,
    })
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
    const json = await this.fetchTestResults({
      organization,
      project,
      definitionId,
      branch,
    })
    const { passed, failed, skipped, total } = this.constructor.transform(json)
    return this.constructor.render({
      passed,
      failed,
      skipped,
      total,
      passedLabel,
      failedLabel,
      skippedLabel,
      isCompact: compactMessage !== undefined,
    })
  }
}
