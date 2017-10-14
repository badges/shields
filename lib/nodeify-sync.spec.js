'use strict';

const assert = require('assert');
const nodeifySync = require('./nodeify-sync');

describe('nodeifySync', function() {
  it('Should return the result via the callback', function(done) {
    const exampleValue = {};
    nodeifySync(() => exampleValue, (err, result) => {
      assert.equal(err, undefined);
      assert.strictEqual(result, exampleValue);
      done();
    });
  });

  it('Should catch an error and return it via the callback', function(done) {
    const exampleError = Error('This is my error!');
    nodeifySync(() => { throw exampleError; }, (err, result) => {
      assert.strictEqual(err, exampleError);
      assert.equal(result, undefined);
      done();
    });
  });
});
