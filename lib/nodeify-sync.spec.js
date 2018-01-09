'use strict';

const { expect } = require('chai');
const nodeifySync = require('./nodeify-sync');

describe('nodeifySync()', function() {
  it('Should return the result via the callback', function(done) {
    const exampleValue = {};
    nodeifySync(() => exampleValue, (err, result) => {
      expect(err).to.be.undefined;
      expect(result).to.equal(exampleValue);
      done();
    });
  });

  it('Should catch an error and return it via the callback', function(done) {
    const exampleError = Error('This is my error!');
    nodeifySync(() => { throw exampleError; }, (err, result) => {
      expect(err).to.equal(exampleError);
      expect(result).to.be.undefined;
      done();
    });
  });
});
