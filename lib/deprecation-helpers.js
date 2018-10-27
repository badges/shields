'use strict'

const { Deprecated } = require('../services/errors')

function enforceDeprecation(effectiveDate) {
  if (Date.now() >= effectiveDate.getTime()) {
    throw new Deprecated()
  }
}

module.exports = {
  enforceDeprecation,
}
