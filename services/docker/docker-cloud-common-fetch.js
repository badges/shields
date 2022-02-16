import Joi from 'joi'

const cloudBuildSchema = Joi.object({
  objects: Joi.array()
    .items(
      Joi.object({
        state: Joi.string(),
        build_settings: Joi.array(),
      }).required()
    )
    .required(),
}).required()

async function fetchBuild(serviceInstance, { user, repo }) {
  return serviceInstance._requestJson({
    schema: cloudBuildSchema,
    url: `https://cloud.docker.com/api/build/v1/source`,
    options: { searchParams: { image: `${user}/${repo}` } },
    errorMessages: { 404: 'repo not found' },
  })
}

export { fetchBuild }
