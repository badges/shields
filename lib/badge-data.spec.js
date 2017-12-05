'use strict';

const assert = require('assert');
const { test, given, forCases } = require('sazerac');
const {
  isDataUri,
  hasPrefix,
  isSixHex,
  makeLabel,
  makeLogo,
  makeBadgeData,
  setBadgeColor
} = require('./badge-data');

describe('Badge data helpers', function() {
  test(hasPrefix, () => {
    forCases([
      given('data:image/svg+xml;base64,PHN2ZyB4bWxu', 'data:'),
      given('data:foobar', 'data:'),
    ]).expect(true);
    given('foobar', 'data:').expect(false);
  });

  test(isDataUri, () => {
    given('data:image/svg+xml;base64,PHN2ZyB4bWxu').expect(true);
    forCases([
      given('data:foobar'),
      given('foobar'),
    ]).expect(false);
  });

  test(isSixHex, () => {
    given('f00bae').expect(true);
    forCases([
      given('f00bar'),
      given(''),
      given(undefined),
    ]).expect(false);
  });

  test(makeLabel, () => {
    given('my badge', {}).expect('my badge');
    given('my badge', { label: 'no, my badge' }).expect('no, my badge');
  });

  test(makeLogo, () => {
    forCases([
      given('gratipay', { logo: 'image/svg+xml;base64,PHN2ZyB4bWxu' }),
      given('gratipay', { logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu' }),
    ]).expect('data:image/svg+xml;base64,PHN2ZyB4bWxu');
    forCases([
      given('gratipay', { logo: '' }),
      given(undefined, {}),
    ]).expect(undefined);
    given('gratipay', {}).assert('should be truthy', assert.ok);
  });

  test(makeBadgeData, () => {
    given('my badge', {
      label: 'no, my badge',
      style: 'flat-square',
      logo: 'image/svg+xml;base64,PHN2ZyB4bWxu',
      logoWidth: '25',
      link: 'https://example.com/',
      colorA: 'blue',
      colorB: 'f00bae',
    }).expect({
      text: ['no, my badge', 'n/a'],
      colorscheme: 'lightgrey',
      template: 'flat-square',
      logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      logoWidth: 25,
      links: ['https://example.com/'],
      colorA: 'blue',
      colorB: '#f00bae',
    });
  });

  test(setBadgeColor, () => {
    given({}, 'red').expect({ colorscheme: 'red' });
    given({}, 'f00f00').expect({ colorB: '#f00f00' });
    given({ colorB: '#f00f00', colorscheme: 'blue' }, 'red').expect({ colorscheme: 'red' });
    given({ colorB: '#b00b00', colorscheme: 'blue' }, 'f00f00').expect({ colorB: '#f00f00' });
  });
});
