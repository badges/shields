'use strict';

const getStandardErrorResponse = function(err, res) {
  if (err != null) {
    return {
      text: 'inaccessible',
      colorscheme: 'red',
    };
  } else if (res.statusCode === 404) {
    return {
      text: 'not found',
      colorscheme: 'lightgrey',
    };
  } else if (res.statusCode !== 200) {
    return {
      text: 'invalid',
      colorscheme: 'lightgrey',
    };
  } else {
    return null;
  }
};

module.exports = {
  getStandardErrorResponse,
};
