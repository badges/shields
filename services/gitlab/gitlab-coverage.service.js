import Joi from 'joi'
import { coveragePercentage } from '../color-formatters.js'
import { optionalUrl } from '../validators.js'
import { BaseSvgScrapingService, NotFound } from '../index.js'

const schema = Joi.object({
  message: Joi.string()
    .regex(/^([0-9]+\.[0-9]+%)|unknown$/)
    .required(),
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
  job_name: Joi.string(),
}).required()

const documentation = `
<p>
  Important: If your project is publicly visible, but the badge is like this:
  <img src="https://img.shields.io/badge/coverage-not&nbsp;set&nbsp;up-red" alt="coverage not set up"/>
</p>
<p>
  Check if your pipelines are publicly visible as well.<br />
  Navigate to your project settings on GitLab and choose General Pipelines under CI/CD.<br />
  Then tick the setting Public pipelines.
</p>
<p>
  Now your settings should look like this:
</p>
<img src="https://user-images.githubusercontent.com/12065866/67156911-e225a180-f324-11e9-93ad-10aafbb3e69e.png" alt="Setting Public pipelines set"/>
<p>
Also make sure you have set up code covrage parsing as described <a href="https://docs.gitlab.com/ee/ci/pipelines/settings.html#test-coverage-parsing">here</a>
</p>
<p>
  Your badge should be working fine now.
</p>
`

export default class GitlabCoverage extends BaseSvgScrapingService {
  static category = 'coverage'

  static route = {
    base: 'gitlab/coverage',
    pattern: ':user/:repo/:branch',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Gitlab code coverage',
      namedParams: {
        user: 'gitlab-org',
        repo: 'gitlab-runner',
        branch: 'master',
      },
      staticPreview: this.render({ coverage: 67 }),
      documentation,
    },
    {
      title: 'Gitlab code coverage (specific job)',
      namedParams: {
        user: 'gitlab-org',
        repo: 'gitlab-runner',
        branch: 'master',
      },
      queryParams: { job_name: 'test coverage report' },
      staticPreview: this.render({ coverage: 96 }),
      documentation,
    },
    {
      title: 'Gitlab code coverage (self-hosted)',
      namedParams: { user: 'GNOME', repo: 'at-spi2-core', branch: 'master' },
      queryParams: { gitlab_url: 'https://gitlab.gnome.org' },
      staticPreview: this.render({ coverage: 93 }),
      documentation,
    },
    {
      title: 'Gitlab code coverage (self-hosted, specific job)',
      namedParams: { user: 'GNOME', repo: 'libhandy', branch: 'master' },
      queryParams: {
        gitlab_url: 'https://gitlab.gnome.org',
        job_name: 'unit-test',
      },
      staticPreview: this.render({ coverage: 93 }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'coverage' }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  async fetch({ user, repo, branch, baseUrl = 'https://gitlab.com', jobName }) {
    // Since the URL doesn't return a usable value when an invalid job name is specified,
    // it is recommended to not use the query param at all if not required
    jobName = jobName ? `?job=${jobName}` : ''
    const url = `${baseUrl}/${user}/${repo}/badges/${branch}/coverage.svg${jobName}`
    const errorMessages = {
      401: 'repo not found',
      404: 'repo not found',
    }
    return this._requestSvg({
      schema,
      url,
      errorMessages,
    })
  }

  static transform({ coverage }) {
    if (coverage === 'unknown') {
      throw new NotFound({ prettyMessage: 'not set up' })
    }
    return Number(coverage.slice(0, -1))
  }

  async handle(
    { user, repo, branch },
    { gitlab_url: baseUrl, job_name: jobName }
  ) {
    const { message: coverage } = await this.fetch({
      user,
      repo,
      branch,
      baseUrl,
      jobName,
    })
    return this.constructor.render({
      coverage: this.constructor.transform({ coverage }),
    })
  }
}
