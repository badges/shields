console.error("LOG 1")
import yaml from 'js-yaml'
console.error("LOG 2")
import { collectDefinitions } from '../core/base-service/loader.js'
console.error("LOG 3")
;(async () => {
  console.error("LOG 4")
  const definitions = await collectDefinitions()
  console.error("LOG 5")

  // Omit undefined
  // https://github.com/nodeca/js-yaml/issues/356#issuecomment-312430599
  const cleaned = JSON.parse(JSON.stringify(definitions))
  console.error("LOG 6")

  process.stdout.write(yaml.dump(cleaned, { flowLevel: 5 }))
})()
