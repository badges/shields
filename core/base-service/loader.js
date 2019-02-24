'use strict'

const path = require('path')
const glob = require('glob')
const countBy = require('lodash.countby')
const { categories } = require('../../services/categories')
const BaseService = require('./base')
const { assertValidServiceDefinitionExport } = require('./service-definitions')

const serviceDir = path.join(__dirname, '..', '..', 'services')

class InvalidService extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidService'
  }
}

function loadServiceClasses(servicePaths) {
  if (!servicePaths) {
    servicePaths = glob.sync(path.join(serviceDir, '**', '*.service.js'))
  }

  const serviceClasses = []
  servicePaths.forEach(path => {
    const module = require(path)
    if (
      !module ||
      (module.constructor === Array && module.length === 0) ||
      (module.constructor === Object && Object.keys(module).length === 0)
    ) {
      throw new InvalidService(
        `Expected ${path} to export a service or a collection of services`
      )
    } else if (module.prototype instanceof BaseService) {
      serviceClasses.push(module)
    } else if (module.constructor === Array || module.constructor === Object) {
      for (const key in module) {
        const serviceClass = module[key]
        if (serviceClass.prototype instanceof BaseService) {
          serviceClasses.push(serviceClass)
        } else {
          throw new InvalidService(
            `Expected ${path} to export a service or a collection of services; one of them was ${serviceClass}`
          )
        }
      }
    } else {
      throw new InvalidService(
        `Expected ${path} to export a service or a collection of services; got ${module}`
      )
    }
  })

  serviceClasses.forEach(ServiceClass => ServiceClass.validateDefinition())

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

function checkNames() {
  const services = loadServiceClasses()
  assertNamesUnique(services.map(({ name }) => name), {
    message: 'Duplicate service names found',
  })
  assertNamesUnique(
    services.map(({ _prometheusMetricName }) => _prometheusMetricName),
    {
      message: 'Duplicate Prometheus metric names found',
    }
  )
}

function collectDefinitions() {
  const services = loadServiceClasses()
    // flatMap.
    .map(ServiceClass => ServiceClass.getDefinition())
    .reduce((accum, these) => accum.concat(these), [])

  const result = { schemaVersion: '0', categories, services }

  assertValidServiceDefinitionExport(result)

  return result
}

function loadTesters() {
  return glob
    .sync(path.join(serviceDir, '**', '*.tester.js'))
    .map(path => require(path))
}

module.exports = {
  InvalidService,
  loadServiceClasses,
  checkNames,
  collectDefinitions,
  loadTesters,
}
