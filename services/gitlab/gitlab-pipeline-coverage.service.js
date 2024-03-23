import Joi from 'joi'
import { coveragePercentage } from '../color-formatters.js'
import { optionalUrl } from '../validators.js'
import {
  BaseSvgScrapingService,
  NotFound,
  pathParam,
  queryParam,
} from '../index.js'
import { description, httpErrorsFor } from './gitlab-helper.js'

const schema = Joi.object({
  message: Joi.string()
    .regex(/^([0-9]+\.[0-9]+%)|unknown$/)
    .required(),
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
  job_name: Joi.string(),
  branch: Joi.string(),
}).required()

const moreDocs = `
Important: If your project is publicly visible, but the badge is like this:
<img src="https://img.shields.io/badge/coverage-not&nbsp;set&nbsp;up-red" alt="coverage not set up"/>

Check if your pipelines are publicly visible as well.<br />
Navigate to your project settings on GitLab and choose General Pipelines under CI/CD.<br />
Then tick the setting Public pipelines.

Now your settings should look like this:

<img src="https://user-images.githubusercontent.com/12065866/67156911-e225a180-f324-11e9-93ad-10aafbb3e69e.png" alt="Setting Public pipelines set"/>

Also make sure you have set up code covrage parsing as described <a href="https://docs.gitlab.com/ee/ci/pipelines/settings.html#test-coverage-parsing">here</a>

Your badge should be working fine now.
`

export default class GitlabPipelineCoverage extends BaseSvgScrapingService {
  static category = 'coverage'

  static route = {
    base: 'gitlab/pipeline-coverage',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/pipeline-coverage/{project}': {
      get: {
        summary: 'Gitlab Code Coverage',
        description: description + moreDocs,
        parameters: [
          pathParam({
            name: 'project',
            example: 'gitlab-org/gitlab',
          }),
          queryParam({
            name: 'gitlab_url',
            example: 'https://gitlab.com',
          }),
          queryParam({
            name: 'job_name',
            example: 'jest-integration',
          }),
          queryParam({
            name: 'branch',
            example: 'master',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  async fetch({ project, baseUrl = 'https://gitlab.com', jobName, branch }) {
    // Since the URL doesn't return a usable value when an invalid job name is specified,
    // it is recommended to not use the query param at all if not required
    jobName = jobName ? `?job=${jobName}` : ''
    const url = `${baseUrl}/${decodeURIComponent(
      project,
    )}/badges/${branch}/coverage.svg${jobName}`
    const httpErrors = httpErrorsFor('project not found')
    return this._requestSvg({
      schema,
      url,
      httpErrors,
    })
  }

  static transform({ coverage }) {
    if (coverage === 'unknown') {
      throw new NotFound({ prettyMessage: 'not set up' })
    }
    return Number(coverage.slice(0, -1))
  }

  async handle(
    { project },
    { gitlab_url: baseUrl, job_name: jobName, branch },
  ) {
    const { message: coverage } = await this.fetch({
      project,
      branch,
      baseUrl,
      jobName,
    })
    return this.constructor.render({
      coverage: this.constructor.transform({ coverage }),
    })
  }
}
