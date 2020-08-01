'use strict'

const Joi = require('@hapi/joi')
const { coveragePercentage } = require('../color-formatters')
const { optionalUrl } = require('../validators')
const { BaseSvgScrapingService, NotFound } = require('..')

const badgeSchema = Joi.object({
  message: Joi.alternatives()
    .try(Joi.string().regex(/^([0-9]+\.[0-9]+%)|unknown$/))
    .required(),
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

const documentation = `
<p>
  Important: If your project is publicly visible, but the badge is like this:
  <img src="https://img.shields.io/badge/coverage-not&nbsp;set&nbsp;up-red" alt="build not found"/>
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

module.exports = class GitlabCoverage extends BaseSvgScrapingService {
  static get category() {
    return 'coverage'
  }

  static get route() {
    return {
      base: 'gitlab/coverage',
      pattern: ':user/:repo/:branch+',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
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
        title: 'Gitlab code coverage (self-hosted)',
        namedParams: { user: 'GNOME', repo: 'libhandy', branch: 'master' },
        queryParams: { gitlab_url: 'https://gitlab.gnome.org' },
        staticPreview: this.render({ coverage: 93 }),
        documentation,
      },
    ]
  }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  async handle(
    { user, repo, branch },
    { gitlab_url: baseUrl = 'https://gitlab.com' }
  ) {
    const { message: percentage } = await this._requestSvg({
      schema: badgeSchema,
      url: `${baseUrl}/${user}/${repo}/badges/${branch}/coverage.svg`,
      errorMessages: {
        401: 'repo not found',
        404: 'repo not found',
      },
    })
    if (percentage === 'unknown') {
      throw new NotFound({ prettyMessage: 'not set up' })
    }
    return this.constructor.render({
      coverage: Number(percentage.slice(0, -1)),
    })
  }
}
