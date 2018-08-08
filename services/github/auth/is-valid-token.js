'use strict';

const validTokenRegex = /^[0-9a-f]{40}$/;

function isValidToken(t) {
  return validTokenRegex.test(t);
}

module.exports = isValidToken;
