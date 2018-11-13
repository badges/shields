'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')
// const serverSecrets = require('../../lib/server-secrets')

// const documentation = `
// <p>
//   To obtain your own badge, you need to get 3 pieces of information:
//   <code>ORGANIZATION</code>, <code>PROJECT_ID</code> and <code>DEFINITION_ID</code>.
// </p>
// <p>
//   First, you need to edit your build definition and look at the url:
// </p>
// <img
//   src="https://user-images.githubusercontent.com/3749820/47259976-e2d9ec80-d4b2-11e8-92cc-7c81089a7a2c.png"
//   alt="ORGANIZATION is after the dev.azure.com part, PROJECT_NAME is right after that, DEFINITION_ID is at the end after the id= part." />
// <p>
//   Then, you can get the <code>PROJECT_ID</code> from the <code>PROJECT_NAME</code> using Azure DevOps REST API.
//   Just access to: <code>https://dev.azure.com/ORGANIZATION/_apis/projects/PROJECT_NAME</code>.
// </p>
// <img
//   src="https://user-images.githubusercontent.com/3749820/47266325-1d846900-d535-11e8-9211-2ee72fb91877.png"
//   alt="PROJECT_ID is in the id property of the API response." />
// <p>
//   Your badge will then have the form:
//   <code>https://img.shields.io/vso/build/ORGANIZATION/PROJECT_ID/DEFINITION_ID.svg</code>.
// </p>
// <p>
//   Optionally, you can specify a named branch:
//   <code>https://img.shields.io/vso/build/ORGANIZATION/PROJECT_ID/DEFINITION_ID/NAMED_BRANCH.svg</code>.
// </p>
// `
const {
  coveragePercentage: coveragePercentageColor,
} = require('../../lib/color-formatters')

const latestBuildSchema = Joi.object({
  value: Joi.array()
    .items({
      id: Joi.number().required()
    })
    .required()
}).required()

const buildCodeCoverageSchema = Joi.object({
  coverageData: Joi.array()
  .items({
    coverageStats: Joi.array()
      .items({
        label: Joi.string().required(),
        total: Joi.number().required(),
        covered: Joi.number().required()
      })
      .required()
  })
  .required()
}).required()

module.exports = class AzureDevOpsCoverage extends BaseJsonService {
  static render({ coverage }) {
    return {
      message: `${coverage.toFixed(0)}%`,
      color: coveragePercentageColor(coverage),
    }
  }

  static get defaultBadgeData() {
    return { label: 'coverage' }
  }

  static get category() {
    return 'build'
  }

  static get url() {
    return {
      base: '',
      format: '(?:azure-devops|vso)/coverage/([^/]+)/([^/]+)/([^/]+)(?:/(.+))?',
      capture: ['organization', 'project', 'definitionId', 'branch'],
    }
  }

  async fetch({ url, options, schema }) {
    return this._requestJson({
      url,
      options,
      schema,
      errorMessages: {
        404: 'job or coverage not found',
      },
    })
  }

  async getLatestBuildId(organization, project, definitionId, branch) {
    const url = `https://dev.azure.com/${organization}/${project}/_apis/build/builds?definitions=${definitionId}&$top=1&api-version=5.0-preview.4`;
    const json = await this.fetch({
      url,
      options: { },
      schema: latestBuildSchema
    });
    return json.value[0].id;
  };

  async handle({ organization, project, definitionId, branch }) {
    const buildId = await this.getLatestBuildId(organization, project, definitionId, branch);
    const url = `https://dev.azure.com/${organization}/${project}/_apis/test/codecoverage?buildId=${buildId}&api-version=5.0-preview.1`;

    const json = await this.fetch({
      url,
      options: { },
      schema: buildCodeCoverageSchema
    });

    let covered = 0;
    let total = 0;
    json.coverageData.forEach(cd => {
      cd.coverageStats.forEach(coverageStat => {
        if (coverageStat.label === 'Lines') {
          covered += coverageStat.covered;
          total += coverageStat.total;
        }
      });
    });
    return this.constructor.render({ coverage: (covered / total) * 100 });
  }
}
