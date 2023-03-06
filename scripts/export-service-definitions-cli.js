import yaml from 'js-yaml'
import { collectDefinitions } from '../core/base-service/loader.js'
;(async () => {
  const definitions = await collectDefinitions()

  // filter out static, dynamic and debug badge examples
  const publicCategories = definitions.categories.map(c => c.id)
  definitions.services = definitions.services.filter(s =>
    publicCategories.includes(s.category)
  )

  // Omit undefined
  // https://github.com/nodeca/js-yaml/issues/356#issuecomment-312430599
  const cleaned = JSON.parse(JSON.stringify(definitions))

  process.stdout.write(yaml.dump(cleaned, { flowLevel: 5 }))
})()
