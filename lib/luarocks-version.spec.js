'use strict';

const assert = require('assert');
const {parseVersion, compareVersionLists} = require('./luarocks-version');


describe('LuaRocks-specific helpers', function() {

  describe('compareVersionLists', function() {
    const EQUAL = 0;
    const LESS = -1;
    const GREATER = 1;
    const OPERATOR_SYMBOLS = {
      [EQUAL]: '==',
      [LESS]: '<',
      [GREATER]: '>',
    };
    const tests = [
      {left: [1, 2], right: [1, 2], expected: EQUAL},
      {left: [1, 2, 0], right: [1, 2], expected: EQUAL},
      {left: [1, 2], right: [1, 2, 0, 0], expected: EQUAL},
      {left: [-1, -2], right: [-1, -2, 0, 0], expected: EQUAL},
      {left: [], right: [], expected: EQUAL},
      {left: [1, 2], right: [2, 1], expected: LESS},
      {left: [3, 2], right: [3, 2, 1], expected: LESS},
      {left: [-3, -2], right: [3, 2], expected: LESS},
      {left: [3, 2, -1], right: [3, 2], expected: LESS},
      {left: [-1], right: [], expected: LESS},
      {left: [], right: [1], expected: LESS},
      {left: [1, 2, 1, 2], right: [1, 2, 0, 2], expected: GREATER},
      {left: [5, 2, 0, 1], right: [5, 2], expected: GREATER},
      {left: [-5, 2], right: [-6, 3, 1], expected: GREATER},
      {left: [1, 2], right: [1, 2, -1, 1], expected: GREATER},
      {left: [1, 2, 0, -1], right: [1, 2, -1, 1], expected: GREATER},
      {left: [], right: [-1, 2], expected: GREATER},
      {left: [1, -1], right: [], expected: GREATER},
    ];
    tests.forEach(function(test) {
      const {left, right, expected} = test;
      it(`[${left}] ${OPERATOR_SYMBOLS[expected]} [${right}]`, function() {
        assert.equal(compareVersionLists(left, right), expected);
      });
    });
  });

  describe('parseVersion', function() {
    const tests = [
      {versionString: '1.2.3-1', expected: [1, 2, 3, 1]},
      {versionString: '10.02-3', expected: [10, 2, 3]},
      {versionString: '3.0rc1-2', expected: [3, 0, -1399, 2]},
      {versionString: '2.0-alpha', expected: [2, 0, -3100]},
      {versionString: '2.0-beta', expected: [2, 0, -3000]},
      {versionString: '2.0-beta5', expected: [2, 0, -2995]},
    ];
    tests.forEach(function(test) {
      const {versionString, expected} = test;
      it(`parse '${versionString}' to [${expected}]`, function() {
        assert.deepEqual(parseVersion(versionString), expected);
      });
    });
  });

});
