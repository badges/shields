'use strict'

const Joi = require('joi')

const queryParamSchema = Joi.object({
  disableStrictSSL: Joi.equal(''),
}).required()

const buildUrl = ({ protocol, host, job, lastBuild = true, plugin }) => {
  const jobPrefix = job.indexOf('/') > -1 ? '' : 'job/'
  return `${protocol}://${host}/${jobPrefix}${job}/${
    lastBuild ? 'lastBuild/' : ''
  }${plugin ? `${plugin}/` : ''}api/json`
}

module.exports = {
  queryParamSchema,
  buildTreeParamQueryString: tree => ({ tree }),
  buildUrl,
}
