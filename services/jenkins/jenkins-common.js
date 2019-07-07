'use strict'

const Joi = require('@hapi/joi')

const queryParamSchema = Joi.object({
  disableStrictSSL: Joi.equal(''),
}).required()

const buildUrl = ({
  protocol,
  host,
  job,
  lastCompletedBuild = true,
  plugin,
}) => {
  const jobPrefix = job.indexOf('/') > -1 ? '' : 'job/'
  return `${protocol}://${host}/${jobPrefix}${job}/${
    lastCompletedBuild ? 'lastCompletedBuild/' : ''
  }${plugin ? `${plugin}/` : ''}api/json`
}

module.exports = {
  queryParamSchema,
  buildTreeParamQueryString: tree => ({ tree }),
  buildUrl,
}
