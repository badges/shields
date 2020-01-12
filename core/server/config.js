'use strict'
const deepmerge = require('deepmerge')

function merge(_default, custom) {
  return deepmerge(_default, custom, {
    arrayMerge: function(destinationArray, sourceArray, options) {
      return sourceArray
    },
  })
}

module.exports = {
  merge,
}
