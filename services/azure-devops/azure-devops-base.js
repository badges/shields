import Joi from 'joi'
import { BaseJsonService, NotFound } from '../index.js'

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

export default class AzureDevOpsBase extends BaseJsonService {
  static auth = {
    passKey: 'azure_devops_token',
    authorizedOrigins: ['https://dev.azure.com'],
    defaultToEmptyStringForUser: true,
  }

  async fetch({ url, options, schema, errorMessages }) {
    return this._requestJson(
      this.authHelper.withBasicAuth({
        schema,
        url,
        options,
        errorMessages,
      })
    )
  }

  async getLatestCompletedBuildId(
    organization,
    project,
    definitionId,
    branch,
    errorMessages
  ) {
    // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/azure/devops/build/builds/list?view=azure-devops-rest-5.0
    const url = `https://dev.azure.com/${organization}/${project}/_apis/build/builds`
    const options = {
      searchParams: {
        definitions: definitionId,
        $top: 1,
        statusFilter: 'completed',
        'api-version': '5.0-preview.4',
      },
    }

    if (branch) {
      options.searchParams.branchName = `refs/heads/${branch}`
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
