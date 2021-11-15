import Joi from 'joi'
import { isBuildStatus, renderBuildStatusBadge } from '../build-status.js'
import { BaseJsonService } from '../index.js'

const schema = Joi.object({
  subject: Joi.string().required(),
  status: Joi.alternatives()
    .try(isBuildStatus, Joi.equal('unknown'))
    .required(),
}).required()
const queryParamSchema = Joi.object({
  task: Joi.string(),
  script: Joi.string(),
}).required()

export default class Cirrus extends BaseJsonService {
  static category = 'build'
  static route = {
    base: 'cirrus',
    pattern: 'github/:user/:repo/:branch*',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Cirrus CI - Base Branch Build Status',
      namedParams: { user: 'flutter', repo: 'flutter' },
      pattern: 'github/:user/:repo',
      queryParams: { task: 'analyze', script: 'test' },
      staticPreview: this.render({ status: 'passing' }),
    },
    {
      title: 'Cirrus CI - Specific Branch Build Status',
      pattern: 'github/:user/:repo/:branch',
      namedParams: { user: 'flutter', repo: 'flutter', branch: 'master' },
      queryParams: { task: 'analyze', script: 'test' },
      staticPreview: this.render({ status: 'passing' }),
    },
    {
      title: 'Cirrus CI - Specific Task Build Status',
      pattern: 'github/:user/:repo',
      queryParams: { task: 'analyze' },
      namedParams: { user: 'flutter', repo: 'flutter' },
      staticPreview: this.render({ subject: 'analyze', status: 'passing' }),
    },
    {
      title: 'Cirrus CI - Task and Script Build Status',
      pattern: 'github/:user/:repo',
      queryParams: { task: 'analyze', script: 'test' },
      namedParams: {
        user: 'flutter',
        repo: 'flutter',
      },
      staticPreview: this.render({ subject: 'test', status: 'passing' }),
    },
  ]

  static defaultBadgeData = { label: 'build' }

  static render({ subject, status }) {
    return renderBuildStatusBadge({ label: subject, status })
  }

  async handle({ user, repo, branch }, { script, task }) {
    const json = await this._requestJson({
      schema,
      url: `https://api.cirrus-ci.com/github/${user}/${repo}.json`,
      options: { searchParams: { branch, script, task } },
    })

    return this.constructor.render(json)
  }
}
