'use strict'

const Joi = require('@hapi/joi')
const { BaseJsonService } = require('..')

const keywords = [
  'l10n',
  'i18n',
  'localization',
  'internationalization',
  'translation',
  'translations',
]

const documentation = `
  <p>
    The read-only API token from the Localizely account is required to fetch necessary data.
    <br/>
    You can find more details regarding API tokens under <a href="https://app.localizely.com/account" target="_blank">My profile</a> page.
  </p>
  `

const schema = Joi.object({
  strings: Joi.number().required(),
  reviewedProgress: Joi.number().required(),
  languages: Joi.array()
    .items(
      Joi.object({
        langCode: Joi.string().required(),
        langName: Joi.string().required(),
        strings: Joi.number().required(),
        reviewed: Joi.number().required(),
        reviewedProgress: Joi.number().required(),
      })
    )
    .required(),
}).required()

const queryParamSchema = Joi.object({ token: Joi.string() }).required()

class BaseLocalizelyService extends BaseJsonService {
  async fetch({ projectId, branch, apiToken }) {
    return this._requestJson({
      schema,
      url: `https://api.localizely.com/v1/projects/${projectId}/status`,
      options: {
        qs: { branch },
        headers: { Accept: 'application/json', 'X-Api-Token': apiToken },
      },
      errorMessages: {
        400: 'bad request',
        401: 'unauthorized',
        403: 'forbidden',
      },
    })
  }
}

module.exports = {
  BaseLocalizelyService,
  keywords,
  documentation,
  queryParamSchema,
}
