import Joi from 'joi'
import BaseJsonService from '../../core/base-service/base-json.js'

const queryParamSchema = Joi.object({
  badgeToken: Joi.string().required(),
  projectName: Joi.string(),
}).required()

const schema = Joi.object({
  cost: Joi.string().required(),
})

const documentation = `
  <p>
    Show cost estimates for your repositories and project with the Infracost badge. 🚀
  </p>
  <p>
  To display Infracost costs for a given branch in your repository, you'll need at least one run stored in Infracost Cloud against the branch. If you don't already have Infracost enabled in CI, follow one of our <a href="https://www.infracost.io/docs/integrations/cicd/" target="_blank">dedicated guides</a.
  </p>
  <p>
  The token used to display the badge can be found under the settings tab of your repository in Infracost Cloud. This can be found by navigating to <b>Repos > {Your Repo} > Settings.</b>
  </p>
`

export default class Infracost extends BaseJsonService {
  static category = 'analysis'
  static route = {
    base: 'infracost',
    pattern: ':vcsName/:user/:repo/:branch',
    queryParamSchema,
  }

  static examples = [
    {
      title: 'Infracost repo cost',
      namedParams: {
        vcsName: 'github',
        user: 'infracost',
        repo: 'infracost',
        branch: 'main',
      },
      queryParams: {
        badgeToken: '59ed2f5f-75f9-42ac-ab94-e88cb24a2ad1',
      },
      staticPreview: this.render({ cost: '$3504' }),
      documentation,
    },
    {
      title: 'Infracost project cost',
      namedParams: {
        vcsName: 'github',
        user: 'infracost',
        repo: 'infracost',
        branch: 'main',
      },
      queryParams: {
        badgeToken: '25585702-75fc-43a7-8dfe-f463b62ae5f5',
        projectName: 'production',
      },
      staticPreview: this.render({ cost: '$1762' }),
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'monthly cost' }

  static render({ cost }) {
    return {
      message: cost,
      color: 'purple',
    }
  }

  async fetch({ vcsName, user, repo, branch, projectName, badgeToken }) {
    const url = `https://dashboard.api.infracost.io/shields/repos/${vcsName}/${user}/${repo}/branch/${branch}`
    return this._requestJson({
      schema,
      url,
      options: {
        headers: {
          'X-Badge-Token': badgeToken,
        },
        searchParams: { projectName },
      },
      errorMessages: {
        401: 'invalid Infracost badge token',
        404: 'could not find a cost estimate, please make sure you have a run for this repository stored in Infracost Cloud.',
        500: 'infracost badge service encountered an unexpected error',
      },
    })
  }

  async handle({ vcsName, user, repo, branch }, { badgeToken, projectName }) {
    const { cost } = await this.fetch({
      vcsName,
      user,
      repo,
      branch,
      badgeToken,
      projectName,
    })
    return this.constructor.render({ cost })
  }
}
