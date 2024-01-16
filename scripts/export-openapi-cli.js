import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { collectDefinitions } from '../core/base-service/loader.js'
import { category2openapi } from '../core/base-service/openapi.js'

const specsPath = path.join('frontend', 'categories')

function writeSpec(filename, spec) {
  // Omit undefined
  // https://github.com/nodeca/js-yaml/issues/356#issuecomment-312430599
  const cleaned = JSON.parse(JSON.stringify(spec))

  fs.writeFileSync(
    filename,
    yaml.dump(cleaned, { flowLevel: 5, forceQuotes: true }),
  )
}

;(async () => {
  const definitions = await collectDefinitions()

  for (const category of definitions.categories) {
    const services = definitions.services.filter(
      service => service.category === category.id && !service.isDeprecated,
    )

    writeSpec(
      path.join(specsPath, `${category.id}.yaml`),
      category2openapi({ category, services, sort: true }),
    )
  }

  let coreServices = []
  coreServices = coreServices.concat(
    definitions.services.filter(
      service => service.category === 'static' && !service.isDeprecated,
    ),
  )
  coreServices = coreServices.concat(
    definitions.services.filter(
      service => service.category === 'dynamic' && !service.isDeprecated,
    ),
  )
  writeSpec(
    path.join(specsPath, '1core.yaml'),
    category2openapi({
      category: { name: 'Core' },
      services: coreServices,
      sort: false,
    }),
  )
})()
