'use strict';

const chai = require('chai');
const { assert } = chai;
const { checkErrorResponse } = require('./github-helpers');

chai.use(require('chai-as-promised'));

describe('GitHub Error Handler', function() {
  it('makes not found badge when 422 is returned', function() {
    const badgeData = {'text': []};
    assert.equal(true, checkErrorResponse(badgeData, null, {statusCode: 422}, 'repo not found'));
    assert.equal('repo not found', badgeData.text[1]);
    assert.equal('lightgrey', badgeData.colorscheme);
  });
});
