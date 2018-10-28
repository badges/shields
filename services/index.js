'use strict'

const glob = require('glob')
const BaseService = require('./base')

class InvalidService extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidService'
  }
}

function loadServiceClasses(servicePaths) {
  if (!servicePaths) {
    servicePaths = glob.sync(`${__dirname}/**/*.service.js`)
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

  return serviceClasses
}

function loadTesters() {
  return glob.sync(`${__dirname}/**/*.tester.js`).map(path => require(path))
}

module.exports = {
  InvalidService,
  loadServiceClasses,
  loadTesters,
}
