'use strict'

const { Deprecated } = require('.')

function enforceDeprecation(effectiveDate) {
  if (Date.now() >= effectiveDate.getTime()) {
    throw new Deprecated()
  }
}

module.exports = {
  enforceDeprecation,
}
