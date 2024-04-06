import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { optionalUrl } from '../validators.js'
import {
  BaseSvgScrapingService,
  NotFound,
  redirector,
  pathParam,
  queryParam,
} from '../index.js'
import { description, httpErrorsFor } from './gitlab-helper.js'

const badgeSchema = Joi.object({
  message: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
  branch: Joi.string(),
}).required()

const moreDocs = `
Important: You must use the Project Path, not the Project Id. Additionally, if your project is publicly visible, but the badge is like this:
<img src="https://img.shields.io/badge/build-not&nbsp;found-red" alt="build not found"/>

Check if your pipelines are publicly visible as well.<br />
Navigate to your project settings on GitLab and choose General Pipelines under CI/CD.<br />
Then tick the setting Public pipelines.

Now your settings should look like this:

<img src="https://user-images.githubusercontent.com/12065866/67156911-e225a180-f324-11e9-93ad-10aafbb3e69e.png" alt="Setting Public pipelines set"/>

Your badge should be working fine now.

NB - The badge will display 'inaccessible' if the specified repo was not found on the target Gitlab instance.
`

class GitlabPipelineStatus extends BaseSvgScrapingService {
  static category = 'build'

  static route = {
    base: 'gitlab/pipeline-status',
    pattern: ':project+',
    queryParamSchema,
  }

  static openApi = {
    '/gitlab/pipeline-status/{project}': {
      get: {
        summary: 'Gitlab Pipeline Status',
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
            name: 'branch',
            example: 'master',
          }),
        ],
      },
    },
  }

  static render({ status }) {
    return renderBuildStatusBadge({ status })
  }

  async fetch({ project, branch, baseUrl }) {
    return this._requestSvg({
      schema: badgeSchema,
      url: `${baseUrl}/${decodeURIComponent(
        project,
      )}/badges/${branch}/pipeline.svg`,
      httpErrors: httpErrorsFor('project not found'),
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
    { gitlab_url: baseUrl = 'https://gitlab.com', branch = 'main' },
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
