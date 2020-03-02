'use strict'

const { metric } = require('../text-formatters')
const { floorCount } = require('../color-formatters')
const { BaseJsonService } = require('..')
const Joi = require('@hapi/joi')

const profileSchema = Joi.object({
  treeMonths: Joi.array()
    .items(
      Joi.object({
        projects: Joi.array()
          .items(
            Joi.object({
              trees: Joi.array()
                .required()
                .items(
                  Joi.object({
                    value: Joi.number().positive(),
                  })
                ),
            })
          )
          .required(),
      }).required()
    )
    .required(),
}).required()

module.exports = class OffsetEarthTrees extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'offset-earth/trees',
      pattern: ':owner',
    }
  }

  static get examples() {
    return [
      {
        title: 'Offset Earth (Trees)',
        namedParams: { owner: 'offsetearth' },
        staticPreview: this.render({ count: 250 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'trees' }
  }

  static render({ count }) {
    return { message: metric(count), color: floorCount(count, 10, 50, 100) }
  }

  async fetch({ owner }) {
    const url = `https://api.offset.earth/users/${owner}/profile`
    return this._requestJson({
      url,
      schema: profileSchema,
      errorMessages: {
        404: 'profile not found',
      },
    })
  }

  async handle({ owner }) {
    const json = await this.fetch({ owner })
    let count = 0

    json.treeMonths.forEach(treeMonth => {
      treeMonth.projects.forEach(project => {
        project.trees.forEach(trees => {
          if (trees.value !== undefined) {
            count += trees.value
            return
          }

          count += 1
        })
      })
    })

    return this.constructor.render({ count })
  }
}
