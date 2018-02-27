'use strict';

const versionJsonWithDash = JSON.stringify({
  d: {
    results: [
      { NormalizedVersion: '1.2-beta' }
    ]
  }
});
const versionJsonFirstCharZero = JSON.stringify({
  d: {
    results: [
      { NormalizedVersion: '0.35' }
    ]
  }
});
const versionJsonFirstCharNotZero = JSON.stringify({
  d: {
    results: [
      { NormalizedVersion: '1.2.7' }
    ]
  }
});

module.exports = {
  versionJsonWithDash,
  versionJsonFirstCharZero,
  versionJsonFirstCharNotZero
};
