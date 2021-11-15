import Joi from 'joi'
import { isBuildStatus } from '../build-status.js'

const keywords = ['vso', 'vsts', 'azure-devops']

const schema = Joi.object({
  message: Joi.alternatives()
    .try(
      isBuildStatus,
      Joi.equal('unknown'),
      Joi.equal('set up now'),
      Joi.equal('never built'),
      Joi.equal('never deployed')
    )
    .required(),
}).required()

async function fetch(
  serviceInstance,
  { url, searchParams = {}, errorMessages }
) {
  // Microsoft documentation: https://docs.microsoft.com/en-us/rest/api/vsts/build/status/get
  const { message: status } = await serviceInstance._requestSvg({
    schema,
    url,
    options: { searchParams },
    errorMessages,
  })
  return { status }
}

export { keywords, fetch }
