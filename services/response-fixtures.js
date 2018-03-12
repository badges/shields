'use strict';

const invalidJSON = function() {
  return [
    200,
    '{{{{{invalid json}}',
    { 'Content-Type': 'application/json' }
  ];
};

module.exports = {
  invalidJSON
};
