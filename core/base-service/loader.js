import path from 'path'
console.error("LOG 7")
import { fileURLToPath } from 'url'
console.error("LOG 8")
import glob from 'glob'
console.error("LOG 9")
import countBy from 'lodash.countby'
console.error("LOG 10")
import categories from '../../services/categories.js'
console.error("LOG 11")
import BaseService from './base.js'
console.error("LOG 12")
import { assertValidServiceDefinitionExport } from './service-definitions.js'
console.error("LOG 13")

const serviceDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'services'
)

class InvalidService extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidService'
  }
}

async function loadServiceClasses(servicePaths) {
  if (!servicePaths) {
    servicePaths = glob.sync(path.join(serviceDir, '**', '*.service.js'))
  }

  const serviceClasses = []
  for await (const servicePath of servicePaths) {
    const currentServiceClasses = Object.values(
      await import(`file://${servicePath}`)
    ).flatMap(element =>
      typeof element === 'object' ? Object.values(element) : element
    )

    if (currentServiceClasses.length === 0) {
      throw new InvalidService(
        `Expected ${servicePath} to export a service or a collection of services`
      )
    }
    currentServiceClasses.forEach(serviceClass => {
      if (serviceClass && serviceClass.prototype instanceof BaseService) {
        // Decorate each service class with the directory that contains it.
        serviceClass.serviceFamily = servicePath
          .replace(serviceDir, '')
          .split(path.sep)[1]
        serviceClass.validateDefinition()
        return serviceClasses.push(serviceClass)
      }
      throw new InvalidService(
        `Expected ${servicePath} to export a service or a collection of services; one of them was ${serviceClass}`
      )
    })
  }

  return serviceClasses
}

function assertNamesUnique(names, { message }) {
  const duplicates = {}
  Object.entries(countBy(names))
    .filter(([name, count]) => count > 1)
    .forEach(([name, count]) => {
      duplicates[name] = count
    })
  if (Object.keys(duplicates).length) {
    throw new Error(`${message}: ${JSON.stringify(duplicates, undefined, 2)}`)
  }
}

async function checkNames() {
  const services = await loadServiceClasses()
  assertNamesUnique(
    services.map(({ name }) => name),
    {
      message: 'Duplicate service names found',
    }
  )
}

async function collectDefinitions() {
  const services = (await loadServiceClasses())
    // flatMap.
    .map(ServiceClass => ServiceClass.getDefinition())
    .reduce((accum, these) => accum.concat(these), [])

  const result = { schemaVersion: '0', categories, services }

  assertValidServiceDefinitionExport(result)

  return result
}

async function loadTesters() {
  return Promise.all(
    glob
      .sync(path.join(serviceDir, '**', '*.tester.js'))
      .map(async path => await import(`file://${path}`))
  )
}

export {
  InvalidService,
  loadServiceClasses,
  checkNames,
  collectDefinitions,
  loadTesters,
}
