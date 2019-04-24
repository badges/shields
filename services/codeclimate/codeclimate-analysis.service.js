'use strict'

const Joi = require('joi')
const { BaseJsonService, NotFound } = require('..')
const { colorScale, letterScore } = require('../color-formatters')
const { nonNegativeInteger } = require('../validators')
const { keywords, isLetterGrade, fetchRepo } = require('./codeclimate-common')

const schema = Joi.object({
  data: Joi.object({
    meta: Joi.object({
      issues_count: nonNegativeInteger,
    }).required(),
    attributes: Joi.object({
      ratings: Joi.array()
        .items(
          Joi.object({
            letter: isLetterGrade,
            measure: Joi.object({
              value: Joi.number().required(),
            }).required(),
          })
        )
        .length(1)
        .required(),
    }).required(),
  }).required(),
}).required()

const maintainabilityColorScale = colorScale(
  [50, 80, 90, 95],
  ['red', 'yellow', 'yellowgreen', 'green', 'brightgreen']
)
const techDebtColorScale = colorScale(
  [5, 10, 20, 50],
  ['brightgreen', 'green', 'yellowgreen', 'yellow', 'red']
)
const issueColorScale = colorScale(
  [1, 5, 10, 20],
  ['brightgreen', 'green', 'yellowgreen', 'yellow', 'red']
)

const whichMap = {
  maintainability: {
    transform: data => ({
      maintainabilityLetter: data.attributes.ratings[0].letter,
    }),
    render: ({ maintainabilityLetter }) => ({
      label: 'maintainability',
      message: maintainabilityLetter,
      color: letterScore(maintainabilityLetter),
    }),
  },
  'maintainability-percentage': {
    transform: data => ({
      techDebtPercentage: data.attributes.ratings[0].measure.value,
    }),
    render: ({ techDebtPercentage }) => {
      // maintainability = 100 - technical debt.
      const maintainabilityPercentage = 100 - techDebtPercentage
      return {
        label: 'maintainability',
        message: `${maintainabilityPercentage.toFixed(0)}%`,
        color: maintainabilityColorScale(maintainabilityPercentage),
      }
    },
  },
  'tech-debt': {
    transform: data => ({
      techDebtPercentage: data.attributes.ratings[0].measure.value,
    }),
    render: ({ techDebtPercentage }) => ({
      label: 'technical debt',
      message: `${techDebtPercentage.toFixed(0)}%`,
      color: techDebtColorScale(techDebtPercentage),
    }),
  },
  issues: {
    transform: data => ({
      issueCount: data.meta.issues_count,
    }),
    render: ({ issueCount }) => ({
      label: 'issues',
      message: `${issueCount}`,
      color: issueColorScale(issueCount),
    }),
  },
}

module.exports = class CodeclimateAnalysis extends BaseJsonService {
  static get category() {
    return 'analysis'
  }

  static get route() {
    return {
      base: 'codeclimate',
      pattern:
        ':which(maintainability|maintainability-percentage|tech-debt|issues)/:user/:repo',
    }
  }

  static get examples() {
    return [
      {
        title: 'Code Climate maintainability',
        pattern:
          ':which(maintainability|maintainability-percentage)/:user/:repo',
        namedParams: {
          which: 'maintainability',
          user: 'angular',
          repo: 'angular.js',
        },
        staticPreview: this.render({
          which: 'maintainability',
          maintainabilityLetter: 'F',
        }),
        keywords,
      },
      {
        title: 'Code Climate issues',
        pattern: 'issues/:user/:repo',
        namedParams: { user: 'twbs', repo: 'bootstrap' },
        staticPreview: this.render({
          which: 'issues',
          issueCount: '89',
        }),
        keywords,
      },
      {
        title: 'Code Climate technical debt',
        pattern: 'tech-debt/:user/:repo',
        namedParams: { user: 'jekyll', repo: 'jekyll' },
        staticPreview: this.render({
          which: 'tech-debt',
          techDebtPercentage: 3.0,
        }),
        keywords,
      },
    ]
  }

  static render({ which, ...props }) {
    const { render } = whichMap[which]

    return render(props)
  }

  async fetch({ user, repo }) {
    const {
      id: repoId,
      relationships: {
        latest_default_branch_snapshot: { data: snapshotInfo },
      },
    } = await fetchRepo(this, { user, repo })
    if (snapshotInfo === null) {
      throw new NotFound({ prettyMessage: 'snapshot not found' })
    }
    const { data } = await this._requestJson({
      schema,
      url: `https://api.codeclimate.com/v1/repos/${repoId}/snapshots/${
        snapshotInfo.id
      }`,
    })
    return data
  }

  async handle({ which, user, repo }) {
    const { transform } = whichMap[which]

    const data = await this.fetch({ user, repo })
    const props = transform(data)
    return this.constructor.render({
      which,
      ...props,
    })
  }
}
