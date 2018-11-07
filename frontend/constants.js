import envFlag from 'node-env-flag'

const baseUrl = process.env.BASE_URL
const longCache = envFlag(process.env.LONG_CACHE, false)

export { baseUrl, longCache }
