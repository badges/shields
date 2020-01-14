'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const repositorySchema = Joi.object({
  repo: Joi.string().required(),
  version: Joi.string().required(),
  status: Joi.string().required(),
})

const schema = Joi.array().items(repositorySchema)

module.exports = class BaseRepologyService extends BaseJsonService {
  async fetch({ projectName }) {
    return this._requestJson({
      schema,
      url: `https://repology.org/api/v1/project/${projectName}`,
    })
  }
}
