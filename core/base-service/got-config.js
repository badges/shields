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

/**
 * Build the User-Agent string for outgoing HTTP requests. Incorporates the
 * configured base name and, when available, a version from the deployment
 * environment (Docker image version or Heroku slug commit).
 *
 * @param {string} [userAgentBase] - Base name for the user-agent. Defaults to
 *    the configured `public.userAgentBase`.
 * @returns {string} Formatted user-agent string (e.g. `shields/abc1234`).
 */
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
