'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'github', title: 'Github' });
module.exports = t;

t.create('License')
  .get('/license/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('license'),
    value: Joi.string()
  }));

t.create('Contributors')
  .get('/contributors/cdnjs/cdnjs.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('contributors'),
    value: Joi.number().integer().positive()
  }));

t.create('GitHub closed pull request')
  .get('/issues-pr-closed/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('closed pull requests'),
    value: Joi.string().regex(/^\w+\sclosed$/)
  }));

t.create('GitHub closed pull request raw')
  .get('/issues-pr-closed-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('closed pull requests'),
    value: Joi.string().regex(/^\w+?$/)
  }));

t.create('GitHub pull request')
  .get('/issues-pr/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('pull requests'),
    value: Joi.string().regex(/^\w+\sopen$/)
  }));

t.create('GitHub pull request raw')
  .get('/issues-pr-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('pull requests'),
    value: Joi.string().regex(/^\w+?$/)
  }));

t.create('GitHub pull request')
  .get('/issues-closed/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('closed issues'),
    value: Joi.string().regex(/^\w+\+?\sclosed$/)
  }));

t.create('GitHub pull request raw')
  .get('/issues-closed-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('closed issues'),
    value: Joi.string().regex(/^\w+\+?$/)
  }));

t.create('GitHub issues')
  .get('/issues/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('issues'),
    value: Joi.string().regex(/^\w+\sopen$/)
  }));

t.create('GitHub issues raw')
  .get('/issues-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('issues'),
    value: Joi.string().regex(/^\w+$/)
  }));

t.create('Followers')
  .get('/followers/webcaetano.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('followers'),
    value: Joi.string().regex(/^\w+$/)
  }));

t.create('Watchers')
  .get('/watchers/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('watchers'),
    value: Joi.number().integer().positive()
  }));

t.create('Stars')
  .get('/stars/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('stars'),
    value: Joi.string().regex(/^\w+$/)
  }));

t.create('Forks')
  .get('/forks/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('forks'),
    value: Joi.number().integer().positive()
  }));

t.create('Commits since')
  .get('/commits-since/badges/shields/a0663d8da53fb712472c02665e6ff7547ba945b7.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
    value: Joi.string().regex(/^\w+$/)
  }));

t.create('Release')
  .get('/release/photonstorm/phaser.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('release'),
    value: Joi.string()
  }));

t.create('(pre-)Release')
  .get('/release/photonstorm/phaser/all.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('release'),
    value: Joi.string()
  }));

t.create('Tag')
  .get('/tag/photonstorm/phaser.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('tag'),
    value: Joi.string()
  }));

t.create('File size')
  .get('/size/webcaetano/craft/build/craft.min.js.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('size'),
    value: Joi.string().regex(/^[0-9]*[.]?[0-9]+\s(B|kB|MB|GB|TB|PB|EB|ZB|YB)$/),
  }));

t.create('File size 404')
  .get('/size/webcaetano/craft/build/does-not-exist.min.js.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('size'),
    value: Joi.string().regex(/^repo or file not found$/),
  }));

t.create('File size for "not a regular file"')
  .get('/size/webcaetano/craft/build.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('size'),
    value: Joi.string().regex(/^not a regular file$/),
  }));

t.create('Downloads all releases')
  .get('/downloads/photonstorm/phaser/total.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^\w+\s+total$/)
  }));

t.create('Downloads latest release')
  .get('/downloads/photonstorm/phaser/latest/total.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^\w+$/)
  }));

t.create('Downloads by specific release')
  .get('/downloads/photonstorm/phaser/v.2.4.4/total.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: [Joi.string().regex(/^none$/),Joi.string().regex(/^\w+\s+[\s\S]+$/)]
  }));

t.create('Downloads by specific asset')
  .get('/downloads/photonstorm/phaser/latest/phaser.js.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: [Joi.string().regex(/^none$/),Joi.string().regex(/^\w+\s+\[[\s\S]+]$/)]
}));

