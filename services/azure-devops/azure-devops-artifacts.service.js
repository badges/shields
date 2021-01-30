'use strict'

const Joi = require('joi')
const { version: versionColor } = require('../color-formatters')
const { addv } = require('../text-formatters')
const {
  renderVersionBadge: renderNugetVersionBadge,
} = require('../nuget/nuget-helpers')
const { NotFound } = require('..')
const AzureDevOpsBase = require('./azure-devops-base')

const getPackagesSchema = Joi.object({
  count: Joi.number().required(),
  value: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        normalizedName: Joi.string().required(),
        protocolType: Joi.string().required(),
        versions: Joi.array()
          .items(
            Joi.object({
              version: Joi.string().required(),
            })
          )
          .required()
          .min(1),
      })
    )
    .required(),
}).required()

module.exports = class Example extends AzureDevOpsBase {
  static category = 'build'

  static route = {
    base: 'azure-devops/artifacts',
    pattern: ':which(v|vpre)/:organization/:project/:feedId/:packageName',
  }

  async handle({ which, organization, project, feedId, packageName }) {
    const url = `https://feeds.dev.azure.com/${organization}/${project}/_apis/packaging/Feeds/${feedId}/packages`
    const options = {
      qs: {
        packageNameQuery: packageName,
        $top: 1,
        includeUrls: false,
        isRelease: which === 'v',
        'api-version': '6.0-preview.1',
      },
    }

    const json = await this.fetch({
      url,
      options,
      schema: getPackagesSchema,
      errorMessages: {
        404: 'organization, project or feed not found',
      },
    })

    if (json.value.length === 0) {
      throw new NotFound({ prettyMessage: `${packageName} package not found` })
    }

    const packageObj = json.value[0]
    if (packageObj.normalizedName !== packageName.toLowerCase()) {
      throw new NotFound({ prettyMessage: `${packageName} package not found` })
    }

    const protocolType = packageObj.protocolType
    const version = packageObj.versions[0].version

    return protocolType === 'NuGet'
      ? renderNugetVersionBadge({ version, feed: `Azure Artifacts NuGet` })
      : {
          label: `Azure Artifacts ${protocolType}`,
          message: addv(version),
          color: versionColor(version),
        }
  }
}
