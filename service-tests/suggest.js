'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const frisby = require('icedfrisby-nock')(require('icedfrisby'));

frisby.globalSetup({
  request: {
    headers: { 'origin': 'https://shields.io' }
  }
});
const t = new ServiceTester({ id: 'suggest', title: 'suggest', pathPrefix: '/$suggest' });
module.exports = t;


t.create('issues')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .expectJSONTypes('badges.?', Joi.object().keys({
    name: 'GitHub issues',
    link: 'https://github.com/atom/atom/issues',
    badge: 'https://img.shields.io/github/issues/atom/atom.svg'
  }));

t.create('forks')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .expectJSONTypes('badges.?', Joi.object().keys({
    name: 'GitHub forks',
    link: 'https://github.com/atom/atom/network',
    badge: 'https://img.shields.io/github/forks/atom/atom.svg'
  }));

t.create('stars')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .expectJSONTypes('badges.?', Joi.object().keys({
    name: 'GitHub stars',
    link: 'https://github.com/atom/atom/stargazers',
    badge: 'https://img.shields.io/github/stars/atom/atom.svg'
  }));

t.create('twitter')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .expectJSONTypes('badges.?', Joi.object().keys({
    name: 'Twitter',
    link: 'https://twitter.com/intent/tweet?text=Wow:&url=%5Bobject%20Object%5D',
    badge: 'https://img.shields.io/twitter/url/https/github.com/atom/atom.svg?style=social'
  }));

t.create('license')
  .get('/v1?url=' + encodeURIComponent('https://github.com/atom/atom'))
  .expectJSONTypes('badges.?', Joi.object().keys({
    name: 'GitHub license',
    link: 'https://github.com/atom/atom/blob/master/LICENSE.md',
    badge: 'https://img.shields.io/github/license/atom/atom.svg'
  }));
