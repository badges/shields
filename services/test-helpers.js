'use strict'
const colorscheme = require('../lib/colorscheme.json')
const mapValues = require('lodash.mapvalues')

module.exports = {
  colorScheme: mapValues(colorscheme, 'colorB'),
}
