'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
const { NotFound } = require('../errors')

const latestBuildSchema = Joi.object({
  count: Joi.number().required(),
  value: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
      })
    )
    .required(),
}).required()

module.exports = class BaseAzureDevOpsService extends BaseJsonService {
  async fetch({ url, options, schema, errorMessages }) {
    return this._requestJson({
      schema,
      url,
      options,
      errorMessages,
    })
  }

  async getLatestBuildId(
    organization,
    project,
    definitionId,
    branch,
    headers,
    errorMessages
  ) {
    // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/azure/devops/build/builds/list?view=azure-devops-rest-5.0
    const url = `https://dev.azure.com/${organization}/${project}/_apis/build/builds`
    const options = {
      qs: {
        definitions: definitionId,
        $top: 1,
        'api-version': '5.0-preview.4',
      },
      headers,
    }

    if (branch) {
      options.qs.branch = branch
    }

    const json = await this.fetch({
      url,
      options,
      schema: latestBuildSchema,
      errorMessages,
    })

    if (json.count !== 1) {
      throw new NotFound({ prettyMessage: 'build pipeline not found' })
    }

    return json.value[0].id
  }
}
