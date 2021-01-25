'use strict'

const gql = require('graphql-tag')
const Joi = require('joi')
const { NotFound } = require('..')
const { colorScale } = require('../color-formatters')
const { GithubAuthV4Service } = require('./github-auth-service')
const { documentation, transformErrors } = require('./github-helpers')

const schema = Joi.object({
  data: Joi.object({
    organization: Joi.object({
      project: Joi.object({
        state: Joi.string().required(),
        name: Joi.string().required(),
        columns: Joi.object({
          edges: Joi.array()
            .items({
              node: Joi.object({
                name: Joi.string().required(),
                purpose: Joi.string().required(),
                cards: Joi.object({
                  totalCount: Joi.number().required(),
                }).required(),
              }).required(),
            })
            .min(0),
        }).required(),
      }).allow(null),
    }).allow(null),
  }).required(),
}).required()

const projectColor = colorScale([0, 0.25, 0.5, 0.75, 1])

module.exports = class GithubProjectCardDetail extends GithubAuthV4Service {
  static category = 'issue-tracking'
  static route = {
    base: 'github/projects',
    pattern: ':org/:project_id([0-9]+)/cards/:variant(columns|purpose)',
  }

  static examples = [
    {
      title: 'GitHub project cards by column',
      namedParams: {
        org: 'github',
        project_id: '1',
        variant: 'columns',
      },
      staticPreview: {
        label: 'project',
        message:
          'To do: 4, In progress: 1, Review in progress: 0, Reviewer approved: 0, Done: 4',
        color: projectColor(0.4),
      },
      documentation,
    },
    {
      title: 'GitHub project cards by purpose',
      namedParams: {
        org: 'github',
        project_id: '1',
        variant: 'purpose',
      },
      staticPreview: {
        label: 'project',
        message: 'Todo: 4, In Progress: 1, Done: 4',
        color: projectColor(0.6),
      },
      documentation,
    },
  ]

  static defaultBadgeData = { label: 'project', color: 'informational' }

  static render({ org, project, variant }) {
    const state = {
      todo: project.columns.edges
        .filter((e, i, a) => e.node.purpose === 'TODO')
        .reduce((count, column) => count + column.node.cards.totalCount, 0),
      inProgress: project.columns.edges
        .filter((e, i, a) => e.node.purpose === 'IN_PROGRESS')
        .reduce((count, column) => count + column.node.cards.totalCount, 0),
      done: project.columns.edges
        .filter((e, i, a) => e.node.purpose === 'DONE')
        .reduce((count, column) => count + column.node.cards.totalCount, 0),
    }
    let message = ''
    switch (variant) {
      case 'columns':
        message = project.columns.edges
          .map(column => `${column.node.name}: ${column.node.cards.totalCount}`)
          .join(', ')
        break
      case 'purpose':
        message = `Todo: ${state.todo}, In Progress: ${state.inProgress}, Done: ${state.done}`
        break
    }

    return {
      label: `${project.name}`,
      message,
      color: projectColor(
        state.done / (state.todo + state.inProgress + state.done)
      ),
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
              columns(first: 100) {
                edges {
                  node {
                    name
                    purpose
                    cards {
                      totalCount
                    }
                  }
                }
              }
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
    if (data.organization.project.columns.length === 0) {
      throw new NotFound({ prettyMessage: 'no columns found' })
    }

    return data.organization.project
  }

  async handle({ org, project_id, variant }) {
    const json = await this.fetch({ org, project: parseInt(project_id) })
    const project = this.transform(json)
    project.number = project_id
    return this.constructor.render({ org, project, variant })
  }
}
