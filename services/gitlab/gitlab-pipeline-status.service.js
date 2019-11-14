'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { optionalUrl } = require('../validators')
const { BaseSvgScrapingService, NotFound } = require('..')

const badgeSchema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
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

module.exports = class GitlabPipelineStatus extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'gitlab/pipeline',
      pattern: ':user/:repo/:branch*',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Gitlab pipeline status',
        pattern: ':user/:repo',
        namedParams: { user: 'gitlab-org', repo: 'gitlab-ce' },
        staticPreview: this.render({ status: 'passed' }),
        documentation,
      },
      {
        title: 'Gitlab pipeline status (branch)',
        pattern: ':user/:repo/:branch',
        namedParams: {
          user: 'gitlab-org',
          repo: 'gitlab-ce',
          branch: 'master',
        },
        staticPreview: this.render({ status: 'passed' }),
        documentation,
      },
      {
        title: 'Gitlab pipeline status (self-hosted)',
        pattern: ':user/:repo',
        namedParams: { user: 'GNOME', repo: 'pango' },
        queryParams: { gitlab_url: 'https://gitlab.gnome.org' },
        staticPreview: this.render({ status: 'passed' }),
        documentation,
      },
    ]
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle(
    { user, repo, branch = 'master' },
    { gitlab_url: baseUrl = 'https://gitlab.com' }
  ) {
    const { message: status } = await this._requestSvg({
      schema: badgeSchema,
      url: `${baseUrl}/${user}/${repo}/badges/${branch}/pipeline.svg`,
      errorMessages: {
        401: 'repo not found',
        404: 'repo not found',
      },
    })
    if (status === 'unknown') {
      throw new NotFound({ prettyMessage: 'branch not found' })
    }
    return this.constructor.render({ status })
  }
}
