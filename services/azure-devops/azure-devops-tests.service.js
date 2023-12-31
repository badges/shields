import Joi from 'joi'
import { pathParam } from '../index.js'
import {
  testResultOpenApiQueryParams,
  testResultQueryParamSchema,
  renderTestResultBadge,
  documentation as commonDocumentation,
} from '../test-results.js'
import AzureDevOpsBase from './azure-devops-base.js'

const description = `
[Azure Devops](https://dev.azure.com/) (formerly VSO, VSTS) is Microsoft Azure's CI/CD platform.

To obtain your own badge, you need to get 3 pieces of information:
\`ORGANIZATION\`, \`PROJECT\`, \`DEFINITION_ID\`.

First, you need to select your build definition and look at the url:

<img
  src="https://user-images.githubusercontent.com/3749820/47259976-e2d9ec80-d4b2-11e8-92cc-7c81089a7a2c.png"
  alt="ORGANIZATION is after the dev.azure.com part, PROJECT is right after that, DEFINITION_ID is at the end after the id= part." />

Your badge will then have the form:
\`https://img.shields.io/azure-devops/tests/ORGANIZATION/PROJECT/DEFINITION_ID.svg\`.

Optionally, you can specify a named branch:
\`https://img.shields.io/azure-devops/tests/ORGANIZATION/PROJECT/DEFINITION_ID/NAMED_BRANCH.svg\`.

${commonDocumentation}
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

export default class AzureDevOpsTests extends AzureDevOpsBase {
  static category = 'test-results'
  static route = {
    base: 'azure-devops/tests',
    pattern: ':organization/:project/:definitionId/:branch*',
    queryParamSchema: testResultQueryParamSchema,
  }

  static openApi = {
    '/azure-devops/tests/{organization}/{project}/{definitionId}': {
      get: {
        summary: 'Azure DevOps tests',
        description,
        parameters: [
          pathParam({
            name: 'organization',
            example: 'azuredevops-powershell',
          }),
          pathParam({
            name: 'project',
            example: 'azuredevops-powershell',
          }),
          pathParam({
            name: 'definitionId',
            example: '1',
          }),
          ...testResultOpenApiQueryParams,
        ],
      },
    },
    '/azure-devops/tests/{organization}/{project}/{definitionId}/{branch}': {
      get: {
        summary: 'Azure DevOps tests (branch)',
        description,
        parameters: [
          pathParam({
            name: 'organization',
            example: 'azuredevops-powershell',
          }),
          pathParam({
            name: 'project',
            example: 'azuredevops-powershell',
          }),
          pathParam({
            name: 'definitionId',
            example: '1',
          }),
          pathParam({
            name: 'branch',
            example: 'master',
          }),
          ...testResultOpenApiQueryParams,
        ],
      },
    },
  }

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
    const httpErrors = {
      404: 'build pipeline or test result summary not found',
    }
    const buildId = await this.getLatestCompletedBuildId(
      organization,
      project,
      definitionId,
      branch,
      httpErrors,
    )

    // https://dev.azure.com/azuredevops-powershell/azuredevops-powershell/_apis/test/ResultSummaryByBuild?buildId=20
    return await this.fetch({
      url: `https://dev.azure.com/${organization}/${project}/_apis/test/ResultSummaryByBuild`,
      options: {
        searchParams: { buildId },
      },
      schema: buildTestResultSummarySchema,
      httpErrors,
    })
  }

  async handle(
    { organization, project, definitionId, branch },
    {
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    },
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
