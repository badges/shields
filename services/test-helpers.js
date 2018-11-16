'use strict'
const colorscheme = require('../gh-badges/lib/colorscheme.json')
const mapValues = require('lodash.mapvalues')

module.exports = {
  colorScheme: mapValues(colorscheme, 'colorB'),
}
