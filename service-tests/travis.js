'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'travis', title: 'Travis CI/PHP version from .travis.yml' });
module.exports = t;

// Travis CI

t.create('build status on default branch')
  .get('/rust-lang/rust.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('build status on named branch')
  .get('/rust-lang/rust/stable.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('unknown repo')
  .get('/this-repo/does-not-exist.json')
  .expectJSON({ name: 'build', value: 'unknown' });

t.create('missing content-disposition header')
  .get('/foo/bar.json')
  .intercept(nock => nock('https://api.travis-ci.org')
    .head('/foo/bar.svg')
    .reply(200))
  .expectJSON({ name: 'build', value: 'invalid' });

t.create('connection error')
  .get('/foo/bar.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'invalid' });

// PHP version from .travis.yml

t.create('gets the package version of symfony')
    .get('/php-v/symfony/symfony.json')
    .expectJSON({ name: 'PHP', value: '>= 7.1' });

t.create('gets the package version of symfony 2.8')
    .get('/php-v/symfony/symfony/2.8.json')
    .expectJSON({ name: 'PHP', value: '>= 5.4, HHVM' });

t.create('gets the package version of yii')
    .get('/php-v/yiisoft/yii.json')
    .expectJSON({ name: 'PHP', value: '5.3 - 7.1, HHVM' });

t.create('invalid package name')
    .get('/php-v/frodo/is-not-a-package.json')
    .expectJSON({ name: 'PHP', value: 'invalid' });
