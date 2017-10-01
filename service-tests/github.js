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
    value: Joi.string().regex(/^\w+$/)
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

t.create('GitHub closed issues')
  .get('/issues-closed/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('closed issues'),
    value: Joi.string().regex(/^\w+\+?\sclosed$/)
  }));

t.create('GitHub closed issues raw')
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

t.create('Package version')
  .get('/package-json/v/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('package'),
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?$/)
  }));

t.create('Package name')
  .get('/package-json/n/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('package name'),
    value: Joi.equal('gh-badges')
  }));

t.create('Package name - Custom label')
  .get('/package-json/name/badges/shields.json?label=Dev Name')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('Dev Name'),
    value: Joi.equal('gh-badges')
  }));

t.create('Package array')
  .get('/package-json/keywords/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('package keywords'),
    value: Joi.string().regex(/.*?,/)
  }));

t.create('Package object')
  .get('/package-json/dependencies/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('package dependencies'),
    value: Joi.equal('invalid data')
  }));

t.create('Manifest version')
  .get('/manifest-json/v/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('manifest'),
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?$/)
  }));

t.create('Manifest name')
  .get('/manifest-json/n/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('manifest name'),
    value: Joi.equal('IndieGala Helper')
  }));

t.create('Manifest array')
  .get('/manifest-json/permissions/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('manifest permissions'),
    value: Joi.string().regex(/.*?,/)
  }));

t.create('Manifest object')
  .get('/manifest-json/background/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('manifest background'),
    value: Joi.equal('invalid data')
  }));

t.create('Manifest invalid json response')
  .get('/manifest-json/v/RedSparr0w/not-a-real-project.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('manifest'),
    value: Joi.equal('invalid data')
  }));

t.create('Manifest no network connection')
  .get('/manifest-json/v/RedSparr0w/IndieGala-Helper.json')
  .networkOff()
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('manifest'),
    value: Joi.equal('inaccessible')
  }));

t.create('File size')
  .get('/size/webcaetano/craft/build/phaser-craft.min.js.json')
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

t.create('downloads for release without slash')
  .get('/downloads/atom/atom/v0.190.0/total.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? v0\.190\.0$/)
  }));

t.create('downloads for specific asset without slash')
  .get('/downloads/atom/atom/v0.190.0/atom-amd64.deb.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? v0\.190\.0 \[atom-amd64\.deb\]$/)
  }));

t.create('downloads for release with slash')
  .get('/downloads/NHellFire/dban/stable/v2.2.8/total.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? stable\/v2\.2\.8$/)
  }));

t.create('downloads for specific asset with slash')
  .get('/downloads/NHellFire/dban/stable/v2.2.8/dban-2.2.8_i586.iso.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? stable\/v2\.2\.8 \[dban-2\.2\.8_i586\.iso\]$/)
  }));

t.create('downloads for unknown release')
  .get('/downloads/atom/atom/does-not-exist/total.json')
  .expectJSON({ name: 'downloads', value: 'none' });

t.create('hit counter')
  .get('/search/torvalds/linux/goto.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('goto counter'),
    value: Joi.string().regex(/^[0-9]*(k|M|G|T|P|E|Z|Y)$/),
  }));

t.create('hit counter for nonexistent repo')
  .get('/search/torvalds/not-linux/goto.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('goto counter'),
    value: Joi.string().regex(/^repo not found$/),
  }));
