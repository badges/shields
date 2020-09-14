'use strict'

const Joi = require('@hapi/joi')
const { isBuildStatus, renderBuildStatusBadge } = require('../build-status')
const { optionalUrl } = require('../validators')
const {
  BaseSvgScrapingService,
  NotFound,
  Inaccessible,
  redirector,
} = require('..')

const badgeSchema = Joi.object({
  status: Joi.alternatives()
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

class GitlabPipelineStatus extends BaseSvgScrapingService {
  static get category() {
    return 'build'
  }

  static get route() {
    return {
      base: 'gitlab/pipeline',
      pattern: ':user/:repo/:branch+',
      queryParamSchema,
    }
  }

  static get examples() {
    return [
      {
        title: 'Gitlab pipeline status',
        namedParams: {
          user: 'gitlab-org',
          repo: 'gitlab',
          branch: 'master',
        },
        staticPreview: this.render({ status: 'passed' }),
        documentation,
      },
      {
        title: 'Gitlab pipeline status (self-hosted)',
        namedParams: { user: 'GNOME', repo: 'pango', branch: 'master' },
        queryParams: { gitlab_url: 'https://gitlab.gnome.org' },
        staticPreview: this.render({ status: 'passed' }),
        documentation,
      },
    ]
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async fetch({ user, repo, branch, baseUrl }) {
    const url = `${baseUrl}/${user}/${repo}/badges/${branch}/pipeline.svg`
    const options = { headers: { Accept: 'image/svg+xml' } }
    const errorMessages = {
      401: 'repo not found',
      404: 'repo not found',
    }
    try {
      const { buffer } = await this._request({
        url,
        options,
        errorMessages,
      })
      const data = {
        status: super.constructor.valueFromSvgBadge(buffer),
      }

      return super.constructor._validate(data, badgeSchema)
    } catch (e) {
      if (e instanceof Inaccessible) {
        try {
          await this._request({
            url,
            options: {
              ...options,
              ...{ method: 'HEAD', followRedirect: false },
            },
            errorMessages,
          })
        } catch (err) {
          const {
            response: {
              statusCode,
              headers: { location },
            },
          } = err
          if (
            (statusCode === 301 || statusCode === 302) &&
            location === `${baseUrl}/users/sign_in`
          ) {
            throw new NotFound({ prettyMessage: 'repo not found or private' })
          }
        }
      }
      throw e
    }
  }

  async handle(
    { user, repo, branch },
    { gitlab_url: baseUrl = 'https://gitlab.com' }
  ) {
    const { status } = await this.fetch({
      user,
      repo,
      branch,
      baseUrl,
    })

    if (status === 'unknown') {
      throw new NotFound({ prettyMessage: 'branch not found' })
    }
    return this.constructor.render({ status })
  }
}

const GitlabPipelineStatusRedirector = redirector({
  category: 'build',
  route: {
    base: 'gitlab/pipeline',
    pattern: ':user/:repo',
  },
  transformPath: ({ user, repo }) => `/gitlab/pipeline/${user}/${repo}/master`,
  dateAdded: new Date('2020-07-12'),
})

module.exports = {
  GitlabPipelineStatus,
  GitlabPipelineStatusRedirector,
}
