import {Deprecated} from '.';

function enforceDeprecation(effectiveDate) {
  if (Date.now() >= effectiveDate.getTime()) {
    throw new Deprecated()
  }
}

export {
  enforceDeprecation,
};
