import Joi from 'joi'
import config from 'config'
import { optionalUrl } from '../validators.js'
import { BaseJsonService, queryParam, pathParam } from '../index.js'

const schema = Joi.object({
  info: Joi.object({
    version: Joi.string().required(),
    // https://github.com/badges/shields/issues/2022
    // https://github.com/badges/shields/issues/7728
    license: Joi.string().allow('').allow(null),
    license_expression: Joi.string().allow('').allow(null),
    classifiers: Joi.array().items(Joi.string()).required(),
  }).required(),
  urls: Joi.array()
    .items(
      Joi.object({
        packagetype: Joi.string().required(),
      }),
    )
    .required(),
}).required()

export const queryParamSchema = Joi.object({
  pypiBaseUrl: optionalUrl,
}).required()

export const pypiPackageParam = pathParam({
  name: 'packageName',
  example: 'Django',
})

export const pypiBaseUrlParam = queryParam({
  name: 'pypiBaseUrl',
  example: 'https://pypi.org',
})

export const pypiGeneralParams = [pypiPackageParam, pypiBaseUrlParam]

export default class PypiBase extends BaseJsonService {
  constructor(...args) {
    super(...args)
    this._defaultPypiBaseUrl =
      config.util.toObject().public.services.pypi.baseUri
  }

  static buildRoute(base) {
    return {
      base,
      pattern: ':egg+',
      queryParamSchema,
    }
  }

  async fetch({ egg, pypiBaseUrl = this._defaultPypiBaseUrl }) {
    return this._requestJson({
      schema,
      url: `${pypiBaseUrl}/pypi/${egg}/json`,
      httpErrors: { 404: 'package or version not found' },
    })
  }
}
