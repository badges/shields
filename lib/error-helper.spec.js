'use strict';

const { test, given } = require('sazerac');
const { getStandardErrorResponse } = require('./error-helper');

describe('Standard Error Handler', function() {
  test(getStandardErrorResponse, function() {
    given('something other than null', {})
      .expect({
        text: 'inaccessible',
        colorscheme: 'red',
      });

    given(null, {statusCode: 404})
      .expect({
        text: 'not found',
        colorscheme: 'lightgrey',
      });

    given(null, {statusCode: 500})
      .expect({
        text: 'invalid',
        colorscheme: 'lightgrey',
      });

    given(null, {statusCode: 200})
      .expect(null);
  });
});
