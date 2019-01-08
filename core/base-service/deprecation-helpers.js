'use strict'

const { Deprecated } = require('./errors')

function enforceDeprecation(effectiveDate) {
  if (Date.now() >= effectiveDate.getTime()) {
    throw new Deprecated()
  }
}

module.exports = {
  enforceDeprecation,
}
