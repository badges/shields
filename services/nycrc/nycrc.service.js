import Joi from 'joi'
import { coveragePercentage } from '../color-formatters.js'
import { ConditionalGithubAuthV3Service } from '../github/github-auth-service.js'
import { fetchJsonFromRepo } from '../github/github-common-fetch.js'
import {
  InvalidParameter,
  InvalidResponse,
  NotFound,
  pathParam,
  queryParam,
} from '../index.js'

const nycrcSchema = Joi.object({
  branches: Joi.number().min(0).max(100),
  lines: Joi.number().min(0).max(100),
  functions: Joi.number().min(0).max(100),
}).required()

const pkgJSONSchema = Joi.object({
  c8: Joi.object({
    branches: Joi.number().min(0).max(100),
    lines: Joi.number().min(0).max(100),
    functions: Joi.number().min(0).max(100),
  }).optional(),
  nyc: Joi.object({
    branches: Joi.number().min(0).max(100),
    lines: Joi.number().min(0).max(100),
    functions: Joi.number().min(0).max(100),
  }).optional(),
}).required()

const description = `
Create a code coverage badge, based on thresholds stored in a
[.nycrc config file](https://github.com/istanbuljs/nyc#common-configuration-options)
on GitHub.
`

const validThresholds = ['branches', 'lines', 'functions']

export default class Nycrc extends ConditionalGithubAuthV3Service {
  static category = 'coverage'

  static route = {
    base: 'nycrc',
    // TODO: eventually add support for .yml and .yaml:
    pattern: ':user/:repo',
    queryParamSchema: Joi.object({
      config: Joi.string()
        .regex(/(.*\.nycrc)|(.*\.json$)/)
        .default('.nycrc'),
      // Allow the default threshold detection logic to be overridden, .e.g.,
      // favoring lines over branches:
      preferredThreshold: Joi.string()
        .optional()
        .allow(...validThresholds),
    }).required(),
  }

  static openApi = {
    '/nycrc/{user}/{repo}': {
      get: {
        summary: 'nycrc config on GitHub',
        description,
        parameters: [
          pathParam({ name: 'user', example: 'yargs' }),
          pathParam({ name: 'repo', example: 'yargs' }),
          queryParam({ name: 'config', example: '.nycrc' }),
          queryParam({
            name: 'preferredThreshold',
            example: 'lines',
            schema: { type: 'string', enum: validThresholds },
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'min coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  extractThreshold(config, preferredThreshold) {
    const { branches, lines } = config
    if (preferredThreshold) {
      if (!validThresholds.includes(preferredThreshold)) {
        throw new InvalidParameter({
          prettyMessage:
            'threshold must be "branches", "lines", or "functions"',
        })
      }
      if (!config[preferredThreshold]) {
        throw new InvalidResponse({
          prettyMessage: `"${preferredThreshold}" threshold missing`,
        })
      }
      return config[preferredThreshold]
    } else if (branches || lines) {
      // We favor branches over lines for the coverage badge, if both
      // thresholds are provided (as branches is the stricter requirement):
      return branches || lines
    } else {
      throw new InvalidResponse({
        prettyMessage: '"branches" or "lines" threshold missing',
      })
    }
  }

  async handle({ user, repo }, queryParams) {
    const { config, preferredThreshold } = queryParams
    let coverage
    if (config.includes('package.json')) {
      const pkgJson = await fetchJsonFromRepo(this, {
        schema: pkgJSONSchema,
        user,
        repo,
        branch: 'HEAD',
        filename: config,
      })
      const nycConfig = pkgJson.c8 || pkgJson.nyc
      if (!nycConfig) {
        throw new NotFound({
          prettyMessage: 'no nyc or c8 stanza found',
        })
      } else {
        coverage = this.extractThreshold(nycConfig, preferredThreshold)
      }
    } else {
      coverage = this.extractThreshold(
        await fetchJsonFromRepo(this, {
          schema: nycrcSchema,
          user,
          repo,
          branch: 'HEAD',
          filename: config,
        }),
        preferredThreshold,
      )
    }
    return this.constructor.render({ coverage })
  }
}
