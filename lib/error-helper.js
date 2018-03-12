'use strict';

const {
  NotFound,
  InvalidResponse,
} = require('../services/errors');

const checkErrorResponse = function(badgeData, err, res, notFoundMessage = 'not found') {
  if (err != null) {
    badgeData.text[1] = 'inaccessible';
    badgeData.colorscheme = 'red';
    return true;
  } else if (res.statusCode === 404) {
    badgeData.text[1] = notFoundMessage;
    badgeData.colorscheme = 'lightgrey';
    return true;
  } else if (res.statusCode !== 200) {
    badgeData.text[1] = 'invalid';
    badgeData.colorscheme = 'lightgrey';
    return true;
  } else {
    return false;
  }
};

checkErrorResponse.asPromise = function ({ notFoundMessage }) {
  return async function ({ buffer, res }) {
    if (res.statusCode === 404) {
      throw new NotFound(notFoundMessage);
    } else if (res.statusCode !== 200) {
      throw new InvalidResponse();
    }
    return { buffer, res };
  };
};

async function getJson(buffer) {
  try {
    return JSON.parse(buffer);
  } catch (err) {
    throw InvalidResponse('');
  }
};

module.exports = {
  checkErrorResponse,
  getJson,
};
