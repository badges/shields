import path from 'path'
import { fileURLToPath } from 'url'
import { globSync } from 'glob'
import countBy from 'lodash.countby'
import categories from '../../services/categories.js'
import BaseService from './base.js'
import { assertValidServiceDefinitionExport } from './service-definitions.js'

const serviceDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'services',
)

function toUnixPath(path) {
  // glob does not allow \ as a path separator
  // see https://github.com/isaacs/node-glob/blob/main/changelog.md#80
  // so we need to convert to use / for use with glob
  return path.replace(/\\/g, '/')
}

class InvalidService extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidService'
  }
}

function getServicePaths(pattern) {
  return globSync(toUnixPath(path.join(serviceDir, '**', pattern))).sort()
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

async function loadServiceClasses(servicePaths) {
  if (!servicePaths) {
    servicePaths = getServicePaths('*.service.js')
  }

  const serviceClasses = []
  for await (const servicePath of servicePaths) {
    const currentServiceClasses = Object.values(
      await import(`file://${servicePath}`),
    ).flatMap(element =>
      typeof element === 'object' ? Object.values(element) : element,
    )

    if (currentServiceClasses.length === 0) {
      throw new InvalidService(
        `Expected ${servicePath} to export a service or a collection of services`,
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
        `Expected ${servicePath} to export a service or a collection of services; one of them was ${serviceClass}`,
      )
    })
  }

  assertNamesUnique(
    serviceClasses.map(({ name }) => name),
    {
      message: 'Duplicate service names found',
    },
  )

  const routeSummaries = []
  serviceClasses.forEach(function (serviceClass) {
    if (serviceClass.openApi) {
      for (const route of Object.values(serviceClass.openApi)) {
        routeSummaries.push(route.get.summary)
      }
    }
  })
  assertNamesUnique(routeSummaries, {
    message: 'Duplicate route summary found',
  })

  return serviceClasses
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
    getServicePaths('*.tester.js').map(
      async path => await import(`file://${path}`),
    ),
  )
}

export {
  InvalidService,
  loadServiceClasses,
  getServicePaths,
  collectDefinitions,
  loadTesters,
}
