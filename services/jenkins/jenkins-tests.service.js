import Joi from 'joi'
import {
  documentation,
  testResultQueryParamSchema,
  renderTestResultBadge,
} from '../test-results.js'
import { optionalNonNegativeInteger } from '../validators.js'
import { InvalidResponse } from '../index.js'
import JenkinsBase from './jenkins-base.js'
import {
  buildTreeParamQueryString,
  buildUrl,
  queryParamSchema,
} from './jenkins-common.js'

// In the API response, the `actions` array can be empty, and when it is not empty it will contain a
// mix of objects. Some will be empty objects, and several will not have the test count properties.
// The schema is relaxed to handle this and the `transform` function handles the responsibility of
// grabbing the correct object to retrieve the test result metrics.
//
// Sample data set for the `actions` array:
// "actions":[{"_class":"hudson.model.ParametersAction"},{"_class":"hudson.model.CauseAction"},{"_class":"hudson.tasks.junit.TestResultAction","failCount":15,"skipCount":0,"totalCount":753},{},{}]
// https://jenkins.qa.ubuntu.com/view/Trusty/view/Smoke%20Testing/job/trusty-touch-flo-smoke-daily/lastCompletedBuild/api/json?tree=actions[failCount,skipCount,totalCount]
const schema = Joi.object({
  actions: Joi.array()
    .items(
      Joi.object({
        totalCount: optionalNonNegativeInteger,
        failCount: optionalNonNegativeInteger,
        skipCount: optionalNonNegativeInteger,
      })
    )
    .required(),
}).required()

export default class JenkinsTests extends JenkinsBase {
  static category = 'test-results'
  static route = {
    base: 'jenkins',
    pattern: 'tests',
    queryParamSchema: queryParamSchema.concat(testResultQueryParamSchema),
  }

  static examples = [
    {
      title: 'Jenkins tests',
      namedParams: {},
      queryParams: {
        compact_message: null,
        passed_label: 'passed',
        failed_label: 'failed',
        skipped_label: 'skipped',
        jobUrl: 'https://jenkins.sqlalchemy.org/job/alembic_gerrit',
      },
      staticPreview: this.render({
        passed: 477,
        failed: 2,
        skipped: 0,
        total: 479,
        isCompact: false,
      }),
      documentation,
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

  transform({ json }) {
    const testsObject = json.actions.find(o => 'failCount' in o)
    if (!testsObject) {
      throw new InvalidResponse({ prettyMessage: 'no tests found' })
    }

    return {
      passed:
        testsObject.totalCount -
        (testsObject.failCount + testsObject.skipCount),
      failed: testsObject.failCount,
      skipped: testsObject.skipCount,
      total: testsObject.totalCount,
    }
  }

  async handle(
    namedParams,
    {
      jobUrl,
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    }
  ) {
    const json = await this.fetch({
      url: buildUrl({ jobUrl }),
      schema,
      searchParams: buildTreeParamQueryString(
        'actions[failCount,skipCount,totalCount]'
      ),
    })
    const { passed, failed, skipped, total } = this.transform({ json })
    return this.constructor.render({
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
