'use strict'

const Joi = require('@hapi/joi')
const { optionalUrl } = require('../validators')
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

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

module.exports = class TeamCityBuild extends TeamCityBase {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'teamcity/build',
      pattern: ':verbosity(s|e)/:buildId',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'TeamCity Simple Build Status',
        namedParams: {
          verbosity: 's',
          buildId: 'IntelliJIdeaCe_JavaDecompilerEngineTests',
        },
        queryParams: {
          server: 'https://teamcity.jetbrains.com',
        },
        staticPreview: this.render({
          status: 'SUCCESS',
        }),
      },
      {
        title: 'TeamCity Full Build Status',
        namedParams: {
          verbosity: 'e',
          buildId: 'bt345',
        },
        queryParams: {
          server: 'https://teamcity.jetbrains.com',
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

  async handle(
    { verbosity, buildId },
    { server = 'https://teamcity.jetbrains.com' }
  ) {
    // JetBrains Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-BuildStatusIcon
    const buildLocator = `buildType:(id:${buildId})`
    const apiPath = `app/rest/builds/${encodeURIComponent(buildLocator)}`
    const json = await this.fetch({
      url: `${server}/${apiPath}`,
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
