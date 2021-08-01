import { Deprecated } from './index.js'

function enforceDeprecation(effectiveDate) {
  if (Date.now() >= effectiveDate.getTime()) {
    throw new Deprecated()
  }
}

export { enforceDeprecation }
