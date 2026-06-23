import Joi from 'joi'
import { isBuildStatus } from '../build-status.js'

const schema = Joi.object({
  message: Joi.alternatives()
    .try(
      isBuildStatus,
      Joi.equal('unknown'),
      Joi.equal('set up now'),
      Joi.equal('never built'),
      Joi.equal('never deployed'),
    )
    .required(),
}).required()

async function fetch(serviceInstance, { url, searchParams = {}, httpErrors }) {
  // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/vsts/build/status/get
  let requestParams = {
    schema,
    url,
    options: { searchParams },
    httpErrors,
  }
  if (serviceInstance.authHelper?.isConfigured) {
    requestParams = serviceInstance.authHelper.withBasicAuth(requestParams)
  }
  const { message: status } = await serviceInstance._requestSvg(requestParams)
  return { status }
}

export { fetch }
