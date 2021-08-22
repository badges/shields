import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import configModule from 'config'
import Sentry from '@sentry/node'
import Server from './core/server/server.js'

// Set up Sentry reporting as early in the process as possible.
const config = configModule.util.toObject()
const disabledIntegrations = ['Console', 'Http']
Sentry.init({
  dsn: process.env.SENTRY_DSN || config.private.sentry_dsn,
  integrations: integrations => {
    const filtered = integrations.filter(
      integration => !disabledIntegrations.includes(integration.name)
    )
    if (filtered.length !== integrations.length - disabledIntegrations.length) {
      throw Error(
        `An error occurred while filtering integrations. The following inetgrations were found: ${integrations.map(
          ({ name }) => name
        )}`
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

if (fs.existsSync('.env')) {
  console.error(
    'Legacy .env file found. It should be deleted and replaced with environment variables or config/local.yml'
  )
  process.exit(1)
}

const legacySecretsPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'private',
  'secret.json'
)
if (fs.existsSync(legacySecretsPath)) {
  console.error(
    `Legacy secrets file found at ${legacySecretsPath}. It should be deleted and secrets replaced with environment variables or config/local.yml`
  )
  process.exit(1)
}
export const server = new Server(config)

await server.start()
