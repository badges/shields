'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'suggest', title: 'suggest', pathPrefix: '/$suggest' });
module.exports = t;


t.create('issues')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .addHeader('origin', 'https://shields.io')
  .expectJSON('badges.?', {
    name: 'GitHub issues',
    link: 'https://github.com/atom/atom/issues',
    badge: 'https://img.shields.io/github/issues/atom/atom.svg'
  });

t.create('forks')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .addHeader('origin', 'https://shields.io')
  .expectJSON('badges.?', {
    name: 'GitHub forks',
    link: 'https://github.com/atom/atom/network',
    badge: 'https://img.shields.io/github/forks/atom/atom.svg'
  });

t.create('stars')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .addHeader('origin', 'https://shields.io')
  .expectJSON('badges.?', {
    name: 'GitHub stars',
    link: 'https://github.com/atom/atom/stargazers',
    badge: 'https://img.shields.io/github/stars/atom/atom.svg'
  });

t.create('twitter')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .addHeader('origin', 'https://shields.io')
  .expectJSON('badges.?', {
    name: 'Twitter',
    link: 'https://twitter.com/intent/tweet?text=Wow:&url=%5Bobject%20Object%5D',
    badge: 'https://img.shields.io/twitter/url/https/github.com/atom/atom.svg?style=social'
  });

t.create('license')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .addHeader('origin', 'https://shields.io')
  .expectJSON('badges.?', {
    name: 'GitHub license',
    link: 'https://github.com/atom/atom/blob/master/LICENSE.md',
    badge: 'https://img.shields.io/github/license/atom/atom.svg'
  });

t.create('no license for non-existing project')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .addHeader('origin', 'https://shields.io')
  .intercept(nock => nock('https://api.github.com')
    .get(/\/repos\/atom\/atom\/license/)
    .reply(404))
  .expectJSONTypes('badges.*', Joi.object().keys({
    name: Joi.not('GitHub license'),
    badge: Joi.allow(),
    link: Joi.allow()
  }));

t.create('no license when json response is invalid')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .addHeader('origin', 'https://shields.io')
  .intercept(nock => nock('https://api.github.com')
    .get(/\/repos\/atom\/atom\/license/)
    .reply(200, 'invalid json'), {
    'Content-Type': 'application/json;charset=UTF-8'
  })
  .expectJSONTypes('badges.*', Joi.object().keys({
    name: Joi.not('GitHub license'),
    badge: Joi.allow(),
    link: Joi.allow()
  }));

t.create('no license when html_url not found in GitHub api response')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .addHeader('origin', 'https://shields.io')
  .intercept(nock => nock('https://api.github.com')
    .get(/\/repos\/atom\/atom\/license/)
    .reply(200, {
      license: 'MIT'
    }))
  .expectJSONTypes('badges.*', Joi.object().keys({
    name: Joi.not('GitHub license'),
    badge: Joi.allow(),
    link: Joi.allow()
  }));

