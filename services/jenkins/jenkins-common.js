'use strict'

const Joi = require('@hapi/joi')
const { optionalUrl } = require('../validators')

const queryParamSchema = Joi.object({
  disableStrictSSL: Joi.equal(''),
  jobUrl: optionalUrl,
}).required()

const buildRedirectUrl = ({ protocol, host, job }) => {
  const jobPrefix = job.indexOf('/') > -1 ? '' : 'job/'
  return `${protocol}://${host}/${jobPrefix}${job}`
}

const buildUrl = ({ jobUrl, lastCompletedBuild = true, plugin }) => {
  const lastCompletedBuildElement = lastCompletedBuild
    ? 'lastCompletedBuild/'
    : ''
  const pluginElement = plugin ? `${plugin}/` : ''
  return `${jobUrl}/${lastCompletedBuildElement}${pluginElement}api/json`
}

module.exports = {
  queryParamSchema,
  buildTreeParamQueryString: tree => ({ tree }),
  buildUrl,
  buildRedirectUrl,
}
