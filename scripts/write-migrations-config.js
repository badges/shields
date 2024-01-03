import configModule from 'config'
const config = configModule.util.toObject()

const postgresUrl = config?.private?.postgres_url

if (!postgresUrl) {
  process.exit(1)
}

process.stdout.write(JSON.stringify({ url: postgresUrl }))
process.exit(0)
