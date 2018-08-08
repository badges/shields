import envFlag from 'node-env-flag'

const baseUri = process.env.BASE_URL
const longCache = envFlag(process.env.LONG_CACHE, false)

export { baseUri, longCache }
