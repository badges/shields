import configModule from 'config'
import Joi from 'joi'
import { fileSizeBytes } from '../../services/validators.js'

const schema = Joi.object({
  fetchLimitBytes: fileSizeBytes,
  userAgentBase: Joi.string().required(),
}).required()
const config = configModule.util.toObject()
const publicConfig = Joi.attempt(config.public, schema, { allowUnknown: true })

const fetchLimitBytes = publicConfig.fetchLimitBytes

function getUserAgent(userAgentBase = publicConfig.userAgentBase) {
  let version = 'dev'
  if (process.env.DOCKER_SHIELDS_VERSION) {
    version = process.env.DOCKER_SHIELDS_VERSION
  }
  if (process.env.HEROKU_SLUG_COMMIT) {
    version = process.env.HEROKU_SLUG_COMMIT.substring(0, 7)
  }
  return `${userAgentBase}/${version}`
}

export { fetchLimitBytes, getUserAgent }
