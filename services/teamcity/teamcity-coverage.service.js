'use strict'

const Joi = require('@hapi/joi')
const { coveragePercentage } = require('../color-formatters')
const TeamCityBase = require('./teamcity-base')
const { InvalidResponse } = require('..')

const buildStatisticsSchema = Joi.object({
  property: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .required(),
}).required()

module.exports = class TeamCityCoverage extends TeamCityBase {
  static get category() {
    return 'coverage'
  }

  static get route() {
    return {
      // Do not base new services on this route pattern.
      // See https://github.com/badges/shields/issues/3714
      base: 'teamcity/coverage',
      format: '(?:(http|https)/(.+)/)?([^/]+?)',
      capture: ['protocol', 'hostAndPath', 'buildId'],
    }
  }

  static get examples() {
    return [
      {
        title: 'TeamCity Coverage (CodeBetter)',
        pattern: ':buildId',
        namedParams: {
          buildId: 'ReactJSNet_PullRequests',
        },
        staticPreview: this.render({
          coverage: 82,
        }),
      },
      {
        title: 'TeamCity Coverage',
        pattern: ':protocol/:hostAndPath/s/:buildId',
        namedParams: {
          protocol: 'https',
          hostAndPath: 'teamcity.jetbrains.com',
          buildId: 'ReactJSNet_PullRequests',
        },
        staticPreview: this.render({
          coverage: 95,
        }),
      },
    ]
  }

  static get defaultBadgeData() {
    return {
      label: 'coverage',
    }
  }

  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentage(coverage),
    }
  }

  transform({ data }) {
    let covered, total

    for (const p of data.property) {
      if (p.name === 'CodeCoverageAbsSCovered') {
        covered = +p.value
      } else if (p.name === 'CodeCoverageAbsSTotal') {
        total = +p.value
      }

      if (covered !== undefined && total !== undefined) {
        const coverage = covered ? (covered / total) * 100 : 0
        return { coverage }
      }
    }

    throw new InvalidResponse({ prettyMessage: 'no coverage data available' })
  }

  async handle({ protocol, hostAndPath, buildId }) {
    // JetBrains Docs: https://confluence.jetbrains.com/display/TCD18/REST+API#RESTAPI-Statistics
    const buildLocator = `buildType:(id:${buildId})`
    const apiPath = `app/rest/builds/${encodeURIComponent(
      buildLocator
    )}/statistics`
    const data = await this.fetch({
      protocol,
      hostAndPath,
      apiPath,
      schema: buildStatisticsSchema,
    })

    const { coverage } = this.transform({ data })
    return this.constructor.render({ coverage })
  }
}
