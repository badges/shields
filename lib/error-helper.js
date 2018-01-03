'use strict';

const checkErrorResponse = function(badgeData, err, res) {
  if (err != null) {
    badgeData.text[1] = 'inaccessible';
    badgeData.colorscheme = 'red';
    return true;
  } else if (res.statusCode === 404) {
    badgeData.text[1] = 'not found';
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

module.exports = {
  checkErrorResponse,
};
