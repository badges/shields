'use strict'

const Joi = require('@hapi/joi')
const {
  coveragePercentage: coveragePercentageColor,
} = require('../color-formatters')
const { optionalUrl } = require('../validators')
const { BaseSvgScrapingService, NotFound, redirector } = require('..')

const badgeSchema = Joi.object({
  message: Joi.alternatives()
    .try(
      Joi.string().regex(/^([0-9]+\.[0-9]+%)|unknown$/),
      Joi.equal('unknown')
    )
    .required(),
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

const documentation = `
<p>
  Important: If your project is publicly visible, but the badge is like this:
  <img src="https://img.shields.io/badge/build-not&nbsp;found-red" alt="build not found"/>
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
  Your badge should be working fine now.
</p>
`

class GitlabCoverage extends BaseSvgScrapingService {
  static get category() {
    return 'coverage'
  }

  static get route() {
    return {
      base: 'gitlab/coverage',
      pattern: ':user/:repo/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Gitlab code coverage',
        pattern: ':user/:repo',
        namedParams: { user: 'gitlab-org', repo: 'gitlab-runner' },
        staticPreview: this.render({ percentage: 20 }),
        documentation,
      },
      {
        title: 'Gitlab code coverage (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'gitlab-org',
          repo: 'gitlab-runner',
          branch: 'master',
        },
        staticPreview: this.render({ percentage: 100 }),
        documentation,
      },
      {
        title: 'Gitlab code coverage (self-hosted)',
        pattern: ':user/:repo',
        namedParams: { user: 'GNOME', repo: 'libhandy' },
        queryParams: { gitlab_url: 'https://gitlab.gnome.org' },
        staticPreview: this.render({ percentage: 50 }),
        documentation,
      },
    ]
  }

  static render({ percentage }) {
    return {
      message: `${percentage}%`,
      color: coveragePercentageColor(percentage),
    }
  }

  async handle(
    { user, repo, branch = 'master' },
    { gitlab_url: baseUrl = 'https://gitlab.com' }
  ) {
    const { message: percentageText } = await this._requestSvg({
      schema: badgeSchema,
      url: `${baseUrl}/${user}/${repo}/badges/${branch}/coverage.svg?style=flat-square`,
      errorMessages: {
        401: 'repo not found',
        404: 'repo not found',
      },
    })
    if (!/[0-9.]+/.test(percentageText)) {
      throw new NotFound({ prettyMessage: 'not set up' })
    }
    // Parse percentage to a number
    const percentage = Number(/[0-9.]+/.exec(percentageText)[0]).toFixed(0)
    return this.constructor.render({ percentage })
  }
}

const GitlabCoverageRedirector = redirector({
  category: 'coverage',
  route: {
    base: 'gitlab/coverage',
    pattern: ':user/:repo',
  },
  transformPath: ({ user, repo }) => `/gitlab/coverage/${user}/${repo}/master`,
  dateAdded: new Date('2020-07-12'),
})

module.exports = {
  GitlabCoverage,
  GitlabCoverageRedirector,
}
