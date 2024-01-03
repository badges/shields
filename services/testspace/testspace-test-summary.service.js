import { pathParams } from '../index.js'
import {
  documentation as description,
  testResultQueryParamSchema,
  testResultOpenApiQueryParams,
  renderTestResultBadge,
} from '../test-results.js'
import TestspaceBase from './testspace-base.js'

export default class TestspaceTests extends TestspaceBase {
  static route = {
    base: 'testspace/tests',
    pattern: ':org/:project/:space+',
    queryParamSchema: testResultQueryParamSchema,
  }

  static openApi = {
    '/testspace/tests/{org}/{project}/{space}': {
      get: {
        summary: 'Testspace tests',
        description,
        parameters: [
          ...pathParams(
            { name: 'org', example: 'swellaby' },
            { name: 'project', example: 'swellaby:testspace-sample' },
            { name: 'space', example: 'main' },
          ),
          ...testResultOpenApiQueryParams,
        ],
      },
    },
  }

  async handle(
    { org, project, space },
    {
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    },
  ) {
    const json = await this.fetch({ org, project, space })
    const { passed, failed, skipped, total } = this.transformCaseCounts(json)
    return renderTestResultBadge({
      passed,
      failed,
      skipped,
      total,
      isCompact: compactMessage !== undefined,
      passedLabel,
      failedLabel,
      skippedLabel,
    })
  }
}
