'use strict'

const gql = require('graphql-tag')
const Joi = require('joi')
const { NotFound } = require('..')
const { GithubAuthV4Service } = require('./github-auth-service')
const { documentation, transformErrors } = require('./github-helpers')

const schema = Joi.object({
  data: Joi.object({
    organization: Joi.object({
      project: Joi.object({
        state: Joi.string().required(),
        name: Joi.string().required(),
      }).allow(null),
    }).allow(null),
  }).required(),
}).required()

module.exports = class GithubProjectDetail extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github/projects',
    pattern: ':org/:project_id([0-9]+)',
  }

  static examples = [
    {
      title: 'GitHub project',
      namedParams: {
        org: 'github',
        project_id: '1',
      },
      staticPreview: {
        label: 'project',
        message: 'open',
        color: 'red',
      },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'project', color: 'informational' }

  static render({ org, project }) {
    let color = 'blue'
    let message = project.state

    switch (project.state) {
      case 'OPEN':
        color = 'red'
        message = 'Open'
        break
      case 'CLOSED':
        color = 'green'
        message = 'Closed'
        break
    }

    return {
      label: `${project.name}`,
      message,
      color,
      link: [`https://github.com/orgs/${org}/projects/${project.number}/`],
    }
  }

  async fetch({ org, project }) {
    return this._requestGraphql({
      query: gql`
        query($org: String!, $project: Int!) {
          organization(login: $org) {
            project(number: $project) {
              name
              state
            }
          }
        }
      `,
      variables: { org, project },
      schema,
      transformErrors,
    })
  }

  transform({ data }) {
    if (data.organization == null) {
      throw new NotFound({ prettyMessage: 'org not found' })
    }
    if (data.organization.project == null) {
      throw new NotFound({ prettyMessage: 'project not found' })
    }
    return data.organization.project
  }

  async handle({ org, project_id }) {
    const json = await this.fetch({ org, project: parseInt(project_id) })
    const project = this.transform(json)
    project.number = project_id
    return this.constructor.render({ org, project })
  }
}
