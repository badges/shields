import gql from 'graphql-tag'
import Joi from 'joi'
import { pathParams, queryParam } from '../index.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import { documentation, transformErrors } from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      pullRequest: Joi.object({
        reviewDecision: Joi.string()
          .allow('APPROVED', 'CHANGES_REQUESTED', 'REVIEW_REQUIRED')
          .required(),
        reviews: Joi.object({
          nodes: Joi.array()
            .items(
              Joi.object({
                state: Joi.string()
                  .allow(
                    'APPROVED',
                    'CHANGES_REQUESTED',
                    'DISMISSED',
                    'PENDING',
                  )
                  .required(),
                author: Joi.object({
                  login: Joi.string().required(),
                }).required(),
              }),
            )
            .required(),
        }).required(),
        reviewRequests: Joi.object({
          nodes: Joi.array()
            .items(
              Joi.object({
                requestedReviewer: Joi.object({
                  login: Joi.string().required(),
                }).required(),
              }),
            )
            .required(),
        }).required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  reviewer: Joi.string(),
  branch: Joi.string(),
}).required()

export default class GithubPullRequestReviewStatus extends GithubAuthV4Service {
  static category = 'activity'
  static route = {
    base: 'github/pull-request/review-status',
    pattern: ':user/:repo/:number',
    queryParamSchema,
  }

  static openApi = {
    '/github/pull-request/review-status/{user}/{repo}/{number}': {
      get: {
        summary: 'GitHub Pull Request Review Status',
        description: documentation,
        parameters: [
          ...pathParams(
            {
              name: 'user',
              example: 'badges',
            },
            {
              name: 'repo',
              example: 'shields',
            },
            {
              name: 'number',
              example: '1111',
            },
          ),
          queryParam({
            name: 'reviewer',
            example: 'octocat',
            description: 'Filter reviews by specific reviewer',
          }),
          queryParam({
            name: 'branch',
            example: 'main',
            description: 'Filter by branch name',
          }),
        ],
      },
    },
  }

  static defaultBadgeData = { label: 'review status' }

  static render({
    reviewDecision,
    approvedCount,
    changesRequestedCount,
    pendingCount,
    dismissedCount,
    requiredReviewers,
    reviewer,
  }) {
    let message
    let color

    if (reviewer) {
      if (approvedCount > 0) {
        message = 'approved'
        color = 'brightgreen'
      } else if (changesRequestedCount > 0) {
        message = 'changes requested'
        color = 'orange'
      } else if (pendingCount > 0) {
        message = 'pending'
        color = 'yellow'
      } else if (dismissedCount > 0) {
        message = 'dismissed'
        color = 'lightgrey'
      } else {
        message = 'not reviewed'
        color = 'lightgrey'
      }
    } else {
      if (reviewDecision === 'APPROVED') {
        message = 'approved'
        color = 'brightgreen'
      } else if (reviewDecision === 'CHANGES_REQUESTED') {
        message = 'changes requested'
        color = 'orange'
      } else {
        message = `${approvedCount}/${requiredReviewers} approved`
        color = 'yellow'
      }

      if (changesRequestedCount > 0) {
        message += ` (${changesRequestedCount} requested changes)`
      }
      if (pendingCount > 0) {
        message += ` (${pendingCount} pending)`
      }
      if (dismissedCount > 0) {
        message += ` (${dismissedCount} dismissed)`
      }
    }

    return { message, color }
  }

  async handle({ user, repo, number }, { reviewer, branch }) {
    const {
      data: {
        repository: {
          pullRequest: { reviewDecision, reviews, reviewRequests },
        },
      },
    } = await this._requestGraphql({
      query: gql`
        query ($user: String!, $repo: String!, $number: Int!, $branch: String) {
          repository(owner: $user, name: $repo) {
            pullRequest(number: $number) {
              reviewDecision
              reviews(first: 100) {
                nodes {
                  state
                  author {
                    login
                  }
                }
              }
              reviewRequests(first: 100) {
                nodes {
                  requestedReviewer {
                    ... on User {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        user,
        repo,
        number: parseInt(number, 10),
        branch,
      },
      schema,
      transformErrors,
    })

    const filteredReviews = reviewer
      ? reviews.nodes.filter(review => review.author.login === reviewer)
      : reviews.nodes

    const approvedCount = filteredReviews.filter(
      review => review.state === 'APPROVED',
    ).length
    const changesRequestedCount = filteredReviews.filter(
      review => review.state === 'CHANGES_REQUESTED',
    ).length
    const pendingCount = filteredReviews.filter(
      review => review.state === 'PENDING',
    ).length
    const dismissedCount = filteredReviews.filter(
      review => review.state === 'DISMISSED',
    ).length

    return this.constructor.render({
      reviewDecision,
      approvedCount,
      changesRequestedCount,
      pendingCount,
      dismissedCount,
      requiredReviewers: reviewRequests.nodes.length,
      reviewer,
    })
  }
}
