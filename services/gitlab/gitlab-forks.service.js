import Joi from 'joi'
import { optionalUrl, nonNegativeInteger } from '../validators.js'
import { metric } from '../text-formatters.js'
import GitLabBase from './gitlab-base.js'

const schema = Joi.object({
  forks_count: nonNegativeInteger,
}).required()

const queryParamSchema = Joi.object({
  gitlab_url: optionalUrl,
}).required()

const documentation = `
<p>
  You may use your GitLab Project Id (e.g. 278964) or your Project Path (e.g. gitlab-org/gitlab ).
  Note that only internet-accessible GitLab instances are supported, for example https://jihulab.com, https://gitlab.gnome.org, or https://gitlab.com/.
</p>
`

export default class GitlabForks extends GitLabBase {
  static category = 'social'

  static route = {
    base: 'gitlab/forks',
    pattern: ':project+',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'GitLab forks',
      namedParams: {
        project: 'gitlab-org/gitlab',
      },
      queryParams: { gitlab_url: 'https://gitlab.com' },
      staticPreview: {
        label: 'Fork',
        message: '6.4k',
        style: 'social',
      },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'forks', namedLogo: 'gitlab' }

  static render({ baseUrl, project, forkCount }) {
    return {
      message: metric(forkCount),
      color: 'blue',
      link: [
        `${baseUrl}/${project}/-/forks/new`,
        `${baseUrl}/${project}/-/forks`,
      ],
    }
  }

  async fetch({ project, baseUrl }) {
    // https://docs.gitlab.com/ee/api/projects.html#get-single-project
    return super.fetch({
      schema,
      url: `${baseUrl}/api/v4/projects/${encodeURIComponent(project)}`,
      errorMessages: {
        404: 'project not found',
      },
    })
  }

  async handle({ project }, { gitlab_url: baseUrl = 'https://gitlab.com' }) {
    const { forks_count: forkCount } = await this.fetch({
      project,
      baseUrl,
    })
    return this.constructor.render({ baseUrl, project, forkCount })
  }
}
