'use strict'

const gql = require('graphql-tag')
const Joi = require('@hapi/joi')
const { GithubAuthV4Service } = require('./github-auth-service')
const { documentation, transformErrors } = require('./github-helpers')
const { NotFound } = require('..')

const greenStates = ['SUCCESS']
const redStates = ['ERROR', 'FAILURE']
const blueStates = ['INACTIVE']
const otherStates = ['IN_PROGRESS', 'QUEUED', 'PENDING']

const allState = greenStates
  .concat(redStates)
  .concat(blueStates)
  .concat(otherStates)

const isDeploymentState = Joi.equal(...allState)

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      deployments: Joi.object({
        nodes: Joi.array()
          .items(
            Joi.object({
              latestStatus: Joi.alternatives([
                Joi.object({
                  state: isDeploymentState,
                }),
                null,
              ]),
            })
          )
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

module.exports = class GithubDeployments extends GithubAuthV4Service {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'github/deployments',
      pattern: ':user/:repo/:environment',
    }
  }

  static get examples() {
    return [
      {
        title: 'GitHub deployments',
        namedParams: {
          user: 'badges',
          repo: 'shields',
          environment: 'shields-staging',
        },
        staticPreview: this.render({
          state: 'success',
        }),
        documentation,
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'state' }
  }

  static render({ state }) {
    let color
    if (greenStates.includes(state)) {
      color = 'brightgreen'
    } else if (redStates.includes(state)) {
      color = 'red'
    } else if (blueStates.includes(state)) {
      color = 'blue'
    }

    let message
    if (state === 'IN_PROGRESS') {
      message = 'in progress'
    } else {
      message = state.toLowerCase()
    }

    return {
      message,
      color,
    }
  }

  async fetch({ user, repo, environment }) {
    return this._requestGraphql({
      query: gql`
        query($user: String!, $repo: String!, $environment: String!) {
          repository(owner: $user, name: $repo) {
            deployments(last: 1, environments: [$environment]) {
              nodes {
                latestStatus {
                  state
                }
              }
            }
          }
        }
      `,
      variables: { user, repo, environment },
      schema,
      transformErrors,
    })
  }

  transform({ data }) {
    if (data.repository.deployments.nodes.length === 0) {
      throw new NotFound({ prettyMessage: 'environment not found' })
    }
    // This happens for the brief moment a deployment is created, but no
    // status is created for the deployment (yet).
    if (data.repository.deployments.nodes[0].latestStatus == null) {
      throw new NotFound({ prettyMessage: 'deployment has no status (yet)' })
    }

    const state = data.repository.deployments.nodes[0].latestStatus.state
    return { state }
  }

  async handle({ user, repo, environment }, queryParams) {
    const json = await this.fetch({ user, repo, environment })
    const { state } = this.transform({ data: json.data })
    return this.constructor.render({ state })
  }
}
