'use strict'

const glob = require('glob')
const { BaseService } = require('./base')

function loadServiceClasses() {
  // New-style services
  const servicePaths = glob.sync(`${__dirname}/**/*.service.js`)

  const serviceClasses = []
  servicePaths.forEach(path => {
    const module = require(path)
    if (!module) {
      throw Error(
        `Expected ${path} to export a service or a collection of services; got ${module}`
      )
    } else if (module.prototype instanceof BaseService) {
      serviceClasses.push(module)
    } else {
      for (const key in module) {
        const serviceClass = module[key]
        if (serviceClass.prototype instanceof BaseService) {
          serviceClasses.push(serviceClass)
        } else {
          throw Error(
            `Expected ${path} to export a service or a collection of services; one of them was ${serviceClass}`
          )
        }
      }
    }
  })

  return serviceClasses
}

function loadTesters() {
  return glob.sync(`${__dirname}/**/*.tester.js`).map(path => require(path))
}

module.exports = {
  loadServiceClasses,
  loadTesters,
}
