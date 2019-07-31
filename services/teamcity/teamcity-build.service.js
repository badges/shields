'use strict'

const Joi = require('@hapi/joi')
const TeamCityBase = require('./teamcity-base')

// The statusText field will start with a summary, potentially including test details, followed by an optional suffix.
// Regex was updated to account for that optional suffix to address reported bugs.
// See https://github.com/badges/shields/issues/3244 for an example.
const buildStatusTextRegex = /^Success|Failure|Error|Tests( failed: \d+( \(\d+ new\))?)?(,)?( passed: \d+)?(,)?( ignored: \d+)?(,)?( muted: \d+)?/
const buildStatusSchema = Joi.object({
  status: Joi.equal('SUCCESS', 'FAILURE', 'ERROR').required(),
  statusText: Joi.string()
    .regex(buildStatusTextRegex)
    .required(),
}).required()

module.exports = class TeamCityBuild extends TeamCityBase {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'teamcity',
      // Do not base new services on this route pattern.
      // See https://github.com/badges/shields/issues/3714
      format: '(?:codebetter|(http|https)/(.+)/(s|e))/([^/]+?)',
      capture: ['protocol', 'hostAndPath', 'verbosity', 'buildId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'TeamCity Build Status (CodeBetter)',
        pattern: 'codebetter/:buildId',
        namedParams: {
          buildId: 'IntelliJIdeaCe_JavaDecompilerEngineTests',
        },
        staticPreview: this.render({
          status: 'SUCCESS',
        }),
      },
      {
        title: 'TeamCity Simple Build Status',
        pattern: ':protocol/:hostAndPath/s/:buildId',
        namedParams: {
          protocol: 'https',
          hostAndPath: 'teamcity.jetbrains.com',
          buildId: 'IntelliJIdeaCe_JavaDecompilerEngineTests',
        },
        staticPreview: this.render({
          status: 'SUCCESS',
        }),
      },
      {
        title: 'TeamCity Full Build Status',
        pattern: ':protocol/:hostAndPath/e/:buildId',
        namedParams: {
          protocol: 'https',
          hostAndPath: 'teamcity.jetbrains.com',
          buildId: 'bt345',
        },
        staticPreview: this.render({
          status: 'FAILURE',
          statusText: 'Tests failed: 4, passed: 1103, ignored: 2',
          useVerbose: true,
        }),
        keywords: ['test', 'test results'],
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'build',
    }
  }

  static render({ status, statusText, useVerbose }) {
    if (status === 'SUCCESS') {
      return {
        message: 'passing',
        color: 'brightgreen',
      }
    } else if (statusText && useVerbose) {
      return {
        message: statusText.toLowerCase(),
        color: 'red',
      }
    } else {
      return {
        message: status.toLowerCase(),
        color: 'red',
      }
    }
  }

  async handle({ protocol, hostAndPath, verbosity, buildId }) {
    // JetBrains Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-BuildStatusIcon
    const buildLocator = `buildType:(id:${buildId})`
    const apiPath = `app/rest/builds/${encodeURIComponent(buildLocator)}`
    const json = await this.fetch({
      protocol,
      hostAndPath,
      apiPath,
      schema: buildStatusSchema,
    })
    // If the verbosity is 'e' then the user has requested the verbose (full) build status.
    const useVerbose = verbosity === 'e'
    return this.constructor.render({
      status: json.status,
      statusText: json.statusText,
      useVerbose,
    })
  }
}
