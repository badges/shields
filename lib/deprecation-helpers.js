'use strict'

const { Deprecated } = require('../core/base-service/errors')

function enforceDeprecation(effectiveDate) {
  if (Date.now() >= effectiveDate.getTime()) {
    throw new Deprecated()
  }
}

module.exports = {
  enforceDeprecation,
}
