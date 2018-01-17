'use strict';

const { assert } = require('chai');
const { checkErrorResponse } = require('./error-helper');

describe('Standard Error Handler', function() {
  it('makes inaccessible badge', function() {
    const badgeData = {'text': []};
    assert.equal(true, checkErrorResponse(badgeData, 'something other than null', {}));
    assert.equal('inaccessible', badgeData.text[1]);
    assert.equal('red', badgeData.colorscheme);
  });

  it('makes not found badge', function() {
    const badgeData = {'text': []};
    assert.equal(true, checkErrorResponse(badgeData, null, {statusCode: 404}));
    assert.equal('not found', badgeData.text[1]);
    assert.equal('lightgrey', badgeData.colorscheme);
  });

  it('makes not found badge with custom error', function() {
    const badgeData = {'text': []};
    assert.equal(true, checkErrorResponse(badgeData, null, {statusCode: 404}, 'custom message'));
    assert.equal('custom message', badgeData.text[1]);
    assert.equal('lightgrey', badgeData.colorscheme);
  });

  it('makes invalid badge', function() {
    const badgeData = {'text': []};
    assert.equal(true, checkErrorResponse(badgeData, null, {statusCode: 500}));
    assert.equal('invalid', badgeData.text[1]);
    assert.equal('lightgrey', badgeData.colorscheme);
  });

  it('return false on 200 status', function() {
    assert.equal(false, checkErrorResponse({'text': []}, null, {statusCode: 200}));
  });
});
