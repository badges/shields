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
  branch: Joi.string(),
}).required()

const documentation = `
<p>
  Important: You must use the Project Path, not the Project Id. Additionally, if your project is publicly visible, but the badge is like this:
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
    base: 'gitlab/pipeline-status',
    pattern: ':project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Gitlab pipeline status',
      namedParams: { project: 'gitlab-org/gitlab' },
      queryParams: { branch: 'master' },
      staticPreview: this.render({ status: 'passed' }),
      documentation,
    },
    {
      title: 'Gitlab pipeline status (self-hosted)',
      namedParams: { project: 'GNOME/pango' },
      queryParams: { gitlab_url: 'https://gitlab.gnome.org', branch: 'master' },
      staticPreview: this.render({ status: 'passed' }),
      documentation,
    },
  ]

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async fetch({ project, branch, baseUrl }) {
    return this._requestSvg({
      schema: badgeSchema,
      url: `${baseUrl}/${decodeURIComponent(
        project
      )}/badges/${branch}/pipeline.svg`,
      errorMessages: {
        401: 'repo not found',
        404: 'repo not found',
      },
    })
  }

  static transform(data) {
    const { message: status } = data
    if (status === 'unknown') {
      throw new NotFound({ prettyMessage: 'branch not found' })
    }
    return { status }
  }

  async handle(
    { project },
    { gitlab_url: baseUrl = 'https://gitlab.com', branch = 'main' }
  ) {
    const data = await this.fetch({
      project,
      branch,
      baseUrl,
    })
    const { status } = this.constructor.transform(data)
    return this.constructor.render({ status })
  }
}

const GitlabPipelineStatusRedirector = redirector({
  category: 'build',
  name: 'GitlabPipelineStatusRedirector',
  route: {
    base: 'gitlab/pipeline',
    pattern: ':user/:repo',
  },
  transformPath: ({ user, repo }) => `/gitlab/pipeline-status/${user}/${repo}`,
  transformQueryParams: ({ _b }) => ({ branch: 'master' }),
  dateAdded: new Date('2020-07-12'),
})

const GitlabPipelineStatusBranchRouteParamRedirector = redirector({
  category: 'build',
  name: 'GitlabPipelineStatusBranchRouteParamRedirector',
  route: {
    base: 'gitlab/pipeline',
    pattern: ':user/:repo/:branch+',
  },
  transformPath: ({ user, repo }) => `/gitlab/pipeline-status/${user}/${repo}`,
  transformQueryParams: ({ branch }) => ({ branch }),
  dateAdded: new Date('2021-10-20'),
})

export {
  GitlabPipelineStatus,
  GitlabPipelineStatusRedirector,
  GitlabPipelineStatusBranchRouteParamRedirector,
}
