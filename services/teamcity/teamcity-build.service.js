import Joi from 'joi'
import { optionalUrl } from '../validators.js'
import { pathParam, queryParam } from '../index.js'
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

  static openApi = {
    '/teamcity/build/s/{buildId}': {
      get: {
        summary: 'TeamCity Simple Build Status',
        parameters: [
          pathParam({
            name: 'buildId',
            example: 'IntelliJIdeaCe_JavaDecompilerEngineTests',
          }),
          queryParam({
            name: 'server',
            example: 'https://teamcity.jetbrains.com',
          }),
        ],
      },
    },
    '/teamcity/build/e/{buildId}': {
      get: {
        summary: 'TeamCity Full Build Status',
        parameters: [
          pathParam({ name: 'buildId', example: 'bt345' }),
          queryParam({
            name: 'server',
            example: 'https://teamcity.jetbrains.com',
          }),
        ],
      },
    },
  }

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
    { server = 'https://teamcity.jetbrains.com' },
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
