'use strict'

const Joi = require('@hapi/joi')
const { nonNegativeInteger } = require('../validators')
const { coveragePercentage } = require('../color-formatters')
const { BaseJsonService } = require('..')

const schema = Joi.object({
  response: Joi.object({
    code: nonNegativeInteger.required(), // nonNegativeInteger,
    message: Joi.string().required(),
  }).required(),
  result: Joi.object({
    languages: Joi.array()
      .items({
        name: Joi.string().required(),
        code: Joi.string().required(),
        percentage: nonNegativeInteger.required(),
      })
      .required(),
  }).required(),
}).required()

const queryParamSchema = Joi.object({
  token: Joi.string().required(),
}).required()

module.exports = class POEditor extends BaseJsonService {
  static get category() {
    return 'other'
  }

  static get route() {
    return {
      base: 'poeditor',
      pattern: ':projectId/:languageCode',
      queryParamSchema,
    }
  }

  static render({ code, message, language }) {
    const color = 'lightgrey'

    if (code !== 200) {
      return { message, color }
    }

    if (language === undefined) {
      return { message: `Language not in project`, color }
    }

    return {
      label: language.name,
      message: `${language.percentage}%`,
      color: coveragePercentage(language.percentage),
    }
  }

  async fetch({ projectId, token }) {
    return this._requestJson({
      schema,
      url: 'https://api.poeditor.com/v2/languages/list',
      options: {
        method: 'POST',
        form: {
          api_token: token,
          id: projectId,
        },
      },
    })
  }

  async handle({ projectId, languageCode }, { token }) {
    const {
      response: { code, message },
      result: { languages },
    } = await this.fetch({ projectId, token })
    return this.constructor.render({
      code,
      message,
      language: languages.find(lang => lang.code === languageCode),
    })
  }
}
