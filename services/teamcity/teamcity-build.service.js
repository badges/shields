import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import TeamCityBase from './teamcity-base.js'

const buildStatusSchema = Joi.object({
  status: Joi.equal('SUCCESS', 'FAILURE', 'ERROR').required(),
  statusText: Joi.string().required(),
}).required()

const queryParamSchema = Joi.object({
  server: optionalUrl,
}).required()

export default class TeamCityBuild extends TeamCityBase {
  static category = 'build'

  static route = {
    base: 'teamcity/build',
    pattern: ':verbosity(s|e)/:buildId',
    queryParamSchema,
  }

  static examples = [
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

  static defaultBadgeData = {
    label: 'build',
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
