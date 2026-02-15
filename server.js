import configModule from 'config'
import * as Sentry from '@sentry/node'
import Server from './core/server/server.js'

// Set up Sentry reporting as early in the process as possible.
const config = configModule.util.toObject()
const disabledIntegrations = ['Console', 'Http']
Sentry.init({
  dsn: process.env.SENTRY_DSN || config.private.sentry_dsn,
  integrations: integrations => {
    const filtered = integrations.filter(
      integration => !disabledIntegrations.includes(integration.name),
    )
    if (filtered.length !== integrations.length - disabledIntegrations.length) {
      throw Error(
        `An error occurred while filtering integrations. The following integrations were found: ${integrations.map(
          ({ name }) => name,
        )}`,
      )
    }
    return filtered
  },
})

if (+process.argv[2]) {
  config.public.bind.port = +process.argv[2]
}
if (process.argv[3]) {
  config.public.bind.address = process.argv[3]
}

console.log('Configuration:')
console.dir(config.public, { depth: null })

if (config.public.cors != null) {
  console.error(
    'cors.allowedOrigin is no longer supported, its value will be ignored. Please remove it from your config.',
  )
}

export const server = new Server(config)

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...')
  await server.stop()
})

await server.start()
