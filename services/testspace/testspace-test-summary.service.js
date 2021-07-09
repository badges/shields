import {
  documentation,
  testResultQueryParamSchema,
  renderTestResultBadge,
} from '../test-results.js'
import TestspaceBase from './testspace-base.js'

export default class TestspaceTests extends TestspaceBase {
  static route = {
    base: 'testspace/tests',
    pattern: ':org/:project/:space+',
    queryParamSchema: testResultQueryParamSchema,
  }

  static examples = [
    {
      title: 'Testspace tests',
      namedParams: {
        org: 'swellaby',
        project: 'swellaby:testspace-sample',
        space: 'main',
      },
      queryParams: {
        passed_label: 'passed',
        failed_label: 'failed',
        skipped_label: 'skipped',
      },
      staticPreview: renderTestResultBadge({
        passed: 477,
        failed: 2,
        skipped: 0,
        total: 479,
        isCompact: false,
      }),
      documentation,
    },
    {
      title: 'Testspace tests (compact)',
      namedParams: {
        org: 'swellaby',
        project: 'swellaby:testspace-sample',
        space: 'main',
      },
      queryParams: {
        compact_message: null,
      },
      staticPreview: renderTestResultBadge({
        passed: 20,
        failed: 1,
        skipped: 1,
        total: 22,
        isCompact: true,
      }),
    },
    {
      title: 'Testspace tests with custom labels',
      namedParams: {
        org: 'swellaby',
        project: 'swellaby:testspace-sample',
        space: 'main',
      },
      queryParams: {
        passed_label: 'good',
        failed_label: 'bad',
        skipped_label: 'n/a',
      },
      staticPreview: renderTestResultBadge({
        passed: 20,
        failed: 1,
        skipped: 1,
        total: 22,
        passedLabel: 'good',
        failedLabel: 'bad',
        skippedLabel: 'n/a',
      }),
    },
  ]

  async handle(
    { org, project, space },
    {
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    }
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
