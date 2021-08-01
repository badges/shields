import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { optionalUrl } from '../validators.js'
import { BaseSvgScrapingService, NotFound, redirector } from '../index.js'

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
<p>
  NB - The badge will display 'inaccessible' if the specified repo was not found on the target Gitlab instance.
</p>
`

class GitlabPipelineStatus extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'gitlab/pipeline',
    pattern: ':user/:repo/:branch+',
    queryParamSchema,
  }

  static examples = [
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

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async handle(
    { user, repo, branch },
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

const GitlabPipelineStatusRedirector = redirector({
  category: 'build',
  route: {
    base: 'gitlab/pipeline',
    pattern: ':user/:repo',
  },
  transformPath: ({ user, repo }) => `/gitlab/pipeline/${user}/${repo}/master`,
  dateAdded: new Date('2020-07-12'),
})

export { GitlabPipelineStatus, GitlabPipelineStatusRedirector }
