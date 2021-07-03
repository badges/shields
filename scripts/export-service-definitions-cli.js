import yaml from 'js-yaml'
import { collectDefinitions } from '../core/base-service/loader.js'
;(async () => {
  const definitions = await collectDefinitions()

  // Omit undefined
  // https://github.com/nodeca/js-yaml/issues/356#issuecomment-312430599
  const cleaned = JSON.parse(JSON.stringify(definitions))

  process.stdout.write(yaml.dump(cleaned, { flowLevel: 5 }))
})()
