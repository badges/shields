import bytes from 'bytes'
import configModule from 'config'
import Joi from 'joi'
import { fileSize } from '../../services/validators.js'

const schema = Joi.object({
  fetchLimit: fileSize,
}).required()
const config = configModule.util.toObject()
const publicConfig = Joi.attempt(config.public, schema, { allowUnknown: true })

const fetchLimitBytes = bytes(publicConfig.fetchLimit)

function getUserAgent() {
  return 'Shields.io/2003a'
}
const userAgent = getUserAgent()

export { fetchLimitBytes, userAgent }
