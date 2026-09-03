import fs from 'fs/promises'
import ky from 'ky'
import * as yaml from 'js-yaml'

const resp = await ky('https://api.github.com/versions', {
  timeout: false,
}).json()
const latestDate = resp.sort()[resp.length - 1]

const config = yaml.load(await fs.readFile('./config/default.yml', 'utf8'))

if (latestDate === config.public.services.github.restApiVersion) {
  console.log("We're already using the latest version. No change needed.")
  process.exit(0)
}

config.public.services.github.restApiVersion = latestDate
await fs.writeFile(
  './config/default.yml',
  yaml.dump(config, { quoteStyle: 'double' }),
)
