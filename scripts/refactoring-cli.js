'use strict'

const chalk = require('chalk')
const { namedColors } = require('../gh-badges/lib/color')
const { floorCount } = require('../services/color-formatters')
const { loadServiceClasses } = require('../core/base-service/loader')

const serviceClasses = loadServiceClasses()
const legacyServices = serviceClasses
  .map(cls => (typeof cls.registerLegacyRouteHandler === 'function' ? 1 : 0))
  .reduce((a, b) => a + b)
const newServices = serviceClasses.length - legacyServices
const percentDone = ((newServices / serviceClasses.length) * 100).toFixed(2)
const color = floorCount(percentDone, 10, 50, 100)

console.log(`Found ${serviceClasses.length} services:`)
console.log(`- ${legacyServices} legacy services`)
console.log(`- ${newServices} new services`)
console.log(chalk.hex(namedColors[color])(`${percentDone}% done`))
