'use strict'

const chalk = require('chalk')
const mapValues = require('lodash.mapvalues')

const colorscheme = require('../gh-badges/lib/colorscheme.json')
const colorsMap = mapValues(colorscheme, 'colorB')
const { floorCount } = require('./color-formatters')
const { loadServiceClasses } = require('../services')

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
console.log(chalk.hex(colorsMap[color])(`${percentDone}% done`))
