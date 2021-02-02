'use strict'

const Joi = require('joi')
const { version: versionColor } = require('../color-formatters')
const { addv } = require('../text-formatters')
const {
  renderVersionBadge: renderNugetVersionBadge,
} = require('../nuget/nuget-helpers')
const { NotFound } = require('..')
const AzureDevOpsBase = require('./azure-devops-base')
const { keywords } = require('./azure-devops-helpers')

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

function renderArtifactBadge(version, protocolType) {
  return protocolType === 'NuGet'
    ? renderNugetVersionBadge({ version, feed: `Azure Artifacts NuGet` })
    : {
        label: `Azure Artifacts ${protocolType}`,
        message: addv(version),
        color: versionColor(version),
      }
}

module.exports = class AzureDevOpsArtifacts extends AzureDevOpsBase {
  static category = 'version'

  static route = {
    base: 'azure-devops/artifacts',
    pattern: ':prerel(v|vpre)/:organization/:project/:feedId/:packageName',
  }

  static examples = [
    {
      title: 'Azure DevOps Artifacts',
      namedParams: {
        prerel: 'v',
        organization: 'dotnet',
        project: 'NuGetPackageExplorer',
        feedId: 'BuildPackages',
        packageName: 'NuGetPackageExplorer.Core',
      },
      staticPreview: renderArtifactBadge('1.2.28', 'NuGet'),
      keywords,
    },
  ]

  async handle({ prerel, organization, project, feedId, packageName }) {
    const url = `https://feeds.dev.azure.com/${organization}/${project}/_apis/packaging/Feeds/${feedId}/packages`
    const options = {
      qs: {
        packageNameQuery: packageName,
        $top: 1,
        includeUrls: false,
        isRelease: prerel === 'v',
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

    return renderArtifactBadge(version, protocolType)
  }
}
