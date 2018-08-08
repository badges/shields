'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const {
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators');
const { invalidJSON } = require('../response-fixtures');

const t = new ServiceTester({ id: 'aur', title: 'Arch Linux AUR' });
module.exports = t;


// version tests

t.create('version (valid)')
  .get('/version/yaourt.json?style=_shields_test')
  .expectJSONTypes(Joi.object().keys({
    name: 'AUR',
    value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    colorB: '#007ec6',
  }));

t.create('version (valid, out of date)')
  .get('/version/gog-gemini-rue.json?style=_shields_test')
  .expectJSONTypes(Joi.object().keys({
    name: 'AUR',
    value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    colorB: '#fe7d37',
  }));

t.create('version (not found)')
  .get('/version/not-a-package.json')
  .expectJSON({name: 'AUR', value: 'not found'});

t.create('version (connection error)')
  .get('/version/yaourt.json')
  .networkOff()
  .expectJSON({name: 'AUR', value: 'inaccessible'});

t.create('version (unexpected response)')
  .get('/version/yaourt.json')
  .intercept(nock => nock('https://aur.archlinux.org')
    .get('/rpc.php?type=info&arg=yaourt')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'AUR', value: 'invalid'});

t.create('version (error response)')
  .get('/version/yaourt.json')
  .intercept(nock => nock('https://aur.archlinux.org')
    .get('/rpc.php?type=info&arg=yaourt')
    .reply(500, '{"error":"oh noes!!"}')
  )
  .expectJSON({name: 'AUR', value: 'invalid'});

// votes tests

t.create('votes (valid)')
  .get('/votes/yaourt.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'votes',
    value: Joi.number().integer(),
  }));

t.create('votes (not found)')
  .get('/votes/not-a-package.json')
  .expectJSON({name: 'AUR', value: 'not found'});

t.create('votes (connection error)')
  .get('/votes/yaourt.json')
  .networkOff()
  .expectJSON({name: 'AUR', value: 'inaccessible'});

t.create('votes (unexpected response)')
  .get('/votes/yaourt.json')
  .intercept(nock => nock('https://aur.archlinux.org')
    .get('/rpc.php?type=info&arg=yaourt')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'AUR', value: 'invalid'});

t.create('votes (error response)')
  .get('/votes/yaourt.json')
  .intercept(nock => nock('https://aur.archlinux.org')
    .get('/rpc.php?type=info&arg=yaourt')
    .reply(500, '{"error":"oh noes!!"}')
  )
  .expectJSON({name: 'AUR', value: 'invalid'});


// license tests

t.create('license (valid)')
  .get('/license/yaourt.json')
  .expectJSON({name: 'license', value: 'GPL'});

t.create('license (not found)')
  .get('/license/not-a-package.json')
  .expectJSON({name: 'AUR', value: 'not found'});

t.create('license (connection error)')
  .get('/license/yaourt.json')
  .networkOff()
  .expectJSON({name: 'AUR', value: 'inaccessible'});

t.create('license (unexpected response)')
  .get('/license/yaourt.json')
  .intercept(nock => nock('https://aur.archlinux.org')
    .get('/rpc.php?type=info&arg=yaourt')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'AUR', value: 'invalid'});

t.create('license (error response)')
  .get('/license/yaourt.json')
  .intercept(nock => nock('https://aur.archlinux.org')
    .get('/rpc.php?type=info&arg=yaourt')
    .reply(500, '{"error":"oh noes!!"}')
  )
  .expectJSON({name: 'AUR', value: 'invalid'});
