import Joi from 'joi'
import { BaseJsonService } from '../index.js'
import {
  testResultQueryParamSchema,
  renderTestResultBadge,
} from '../test-results.js'
import { nonNegativeInteger } from '../../services/validators.js'

const commonAttrs = {
  namedParams: {
    provider: 'github',
    org: 'tasdemo',
    repo: 'axios',
  },
  queryParams: {
    passed_label: 'passed',
    failed_label: 'failed',
    skipped_label: 'skipped',
    compact_message: null,
  },
}

const schema = Joi.object({
  badge: Joi.object({
    passed: nonNegativeInteger,
    failed: nonNegativeInteger,
    skipped: nonNegativeInteger,
    total_tests: nonNegativeInteger,
    status: Joi.string().required(),
  }).required(),
}).required()

export default class TasBuildStatus extends BaseJsonService {
  static category = 'test-results'

  static route = {
    base: 'tas/tests',
    pattern: ':provider/:org/:repo',
    queryParamSchema: testResultQueryParamSchema,
  }

  static examples = [
    {
      title: 'TAS Tests',
      staticPreview: this.render({
        passed: 20,
        failed: 1,
        skipped: 1,
        total: 22,
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

  async fetch({ provider, org, repo }) {
    return this._requestJson({
      schema,
      url: `https://api.tas.lambdatest.com/repo/badge?git_provider=${provider}&org=${org}&repo=${repo}`,
      httpErrors: {
        401: 'private project not supported',
        404: 'project not found',
      },
    })
  }

  async handle(
    { provider, org, repo },
    {
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    }
  ) {
    const { badge } = await this.fetch({ provider, org, repo })
    return this.constructor.render({
      passed: badge.passed,
      failed: badge.failed,
      skipped: badge.skipped,
      total: badge.total_tests,
      passedLabel,
      failedLabel,
      skippedLabel,
      isCompact: compactMessage !== undefined,
    })
  }
}
