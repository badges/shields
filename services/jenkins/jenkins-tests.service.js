'use strict'

const Joi = require('joi')
const { InvalidResponse } = require('..')
const {
  testResultQueryParamSchema,
  renderTestResultBadge,
} = require('../test-results')
const { optionalNonNegativeInteger } = require('../validators')
const JenkinsBase = require('./jenkins-base')
const {
  buildTreeParamQueryString,
  buildUrl,
  queryParamSchema,
} = require('./jenkins-common')

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

module.exports = class JenkinsTests extends JenkinsBase {
  static get category() {
    return 'build'
  }

  static get defaultBadgeData() {
    return {
      label: 'tests',
    }
  }

  static get route() {
    return {
      base: 'jenkins/t',
      pattern: ':protocol(http|https)/:host/:job+',
      queryParamSchema: queryParamSchema.concat(testResultQueryParamSchema),
    }
  }

  static get examples() {
    return [
      {
        title: 'Jenkins Tests',
        pattern: ':scheme/:host/:job',
        namedParams: {
          scheme: 'https',
          host: 'jenkins.qa.ubuntu.com',
          job:
            'view/Precise/view/All%20Precise/job/precise-desktop-amd64_default',
        },
        staticPreview: this.render({
          passed: 45,
          total: 45,
        }),
      },
    ]
  }

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
    const testsObject = json.actions.find(o => o.hasOwnProperty('failCount'))
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
    { protocol, host, job },
    {
      disableStrictSSL,
      compact_message: compactMessage,
      passed_label: passedLabel,
      failed_label: failedLabel,
      skipped_label: skippedLabel,
    }
  ) {
    const json = await this.fetch({
      url: buildUrl({ protocol, host, job }),
      schema,
      qs: buildTreeParamQueryString('actions[failCount,skipCount,totalCount]'),
      disableStrictSSL,
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
