'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isMetric,
  isFileSize,
  isFormattedDate,
  isVPlusDottedVersionAtLeastOne
} = require('./helpers/validators');

const t = new ServiceTester({ id: 'github', title: 'Github' });
module.exports = t;

t.create('License')
  .get('/license/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({ name: 'license', value: Joi.string() }));

t.create('Contributors')
  .get('/contributors/cdnjs/cdnjs.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'contributors',
    value: Joi.string().regex(/^\w+$/)
  }));

t.create('GitHub closed pull requests')
  .get('/issues-pr-closed/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'pull requests',
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? closed$/)
  }));

t.create('GitHub closed pull requests raw')
  .get('/issues-pr-closed-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'closed pull requests',
    value: Joi.string().regex(/^\w+?$/)
  }));

t.create('GitHub pull requests')
  .get('/issues-pr/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'pull requests',
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? open$/)
  }));

t.create('GitHub pull requests raw')
  .get('/issues-pr-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'open pull requests',
    value: isMetric
  }));

t.create('GitHub closed issues')
  .get('/issues-closed/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('issues'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? closed$/)
  }));

t.create('GitHub closed issues raw')
  .get('/issues-closed-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('closed issues'),
    value: Joi.string().regex(/^\w+\+?$/)
  }));

t.create('GitHub open issues')
  .get('/issues/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('issues'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? open$/)
  }));

t.create('GitHub open issues raw')
  .get('/issues-raw/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({ name: 'open issues', value: isMetric }));

t.create('GitHub open issues by label is > zero')
  .get('/issues/badges/shields/service-badge.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('service-badge issues'),
    value: Joi.string().regex(/^[1-9][0-9]*[kMGTPEZY]? open$/)
  }));

t.create('GitHub open issues by label is > zero')
  .get('/issues/Cockatrice/Cockatrice/Easy%20Change.json')
  .inspectJSON()
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('Easy Change issues'),
    value: Joi.string().regex(/^[1-9][0-9]*[kMGTPEZY]? open$/)
  }));

t.create('GitHub open issues by label (raw)')
  .get('/issues-raw/badges/shields/service-badge.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('open service-badge issues'),
    value: isMetric
  }));

t.create('GitHub open pull requests by label')
  .get('/issues-pr/badges/shields/vendor-badge.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('vendor-badge pull requests'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? open$/)
  }));

t.create('GitHub open pull requests by label (raw)')
  .get('/issues-pr-raw/badges/shields/vendor-badge.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'open vendor-badge pull requests',
    value: isMetric
  }));

t.create('Followers')
  .get('/followers/webcaetano.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'followers',
    value: Joi.string().regex(/^\w+$/)
  }));

t.create('Watchers')
  .get('/watchers/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'watchers',
    value: Joi.number().integer().positive()
  }));

t.create('Stars')
  .get('/stars/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'stars',
    value: Joi.string().regex(/^\w+$/)
  }));

t.create('Forks')
  .get('/forks/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'forks',
    value: Joi.number().integer().positive()
  }));

t.create('Commits since')
  .get('/commits-since/badges/shields/a0663d8da53fb712472c02665e6ff7547ba945b7.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
    value: Joi.string().regex(/^\w+$/)
  }));

t.create('Commits since by latest release')
  .get('/commits-since/microsoft/typescript/latest.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.string().regex(/^(commits since){1}[\s\S]+$/),
    value: Joi.string().regex(/^\d+\w?$/)
  }));

t.create('Release')
  .get('/release/photonstorm/phaser.json')
  .expectJSONTypes(Joi.object().keys({ name: 'release', value: Joi.string() }));

t.create('(pre-)Release')
  .get('/release/photonstorm/phaser/all.json')
  .expectJSONTypes(Joi.object().keys({ name: 'release', value: Joi.string() }));

t.create('Release Date. e.g release date|today')
.get('/release-date/microsoft/vscode.json')
.expectJSONTypes(Joi.object().keys({
  name: 'release date',
  value: isFormattedDate
}));

t.create('Release Date - Custom Label. e.g myRelease|today')
.get('/release-date/microsoft/vscode.json?label=myRelease')
.expectJSONTypes(Joi.object().keys({
  name: 'myRelease',
  value: isFormattedDate
}));

t.create('Release Date - Should return `no releases or repo not found` for invalid repo')
.get('/release-date/not-valid-name/not-valid-repo.json')
.expectJSON({ name: 'release date', value: 'no releases or repo not found' });

t.create('(Pre-)Release Date. e.g release date|today')
.get('/release-date-pre/microsoft/vscode.json')
.expectJSONTypes(Joi.object().keys({
  name: 'release date',
  value: isFormattedDate
}));

t.create('(Pre-)Release Date - Custom Label. e.g myRelease|today')
.get('/release-date-pre/microsoft/vscode.json?label=myRelease')
.expectJSONTypes(Joi.object().keys({
  name: 'myRelease',
  value: isFormattedDate
}));

t.create('(Pre-)Release Date - Should return `no releases or repo not found` for invalid repo')
.get('/release-date-pre/not-valid-name/not-valid-repo.json')
.expectJSON({ name: 'release date', value: 'no releases or repo not found' });


t.create('Tag')
  .get('/tag/photonstorm/phaser.json')
  .expectJSONTypes(Joi.object().keys({ name: 'tag', value: Joi.string() }));

t.create('Package version')
  .get('/package-json/v/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'package',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('Package name')
  .get('/package-json/n/badges/shields.json')
  .expectJSON({ name: 'package name', value: 'gh-badges' });

t.create('Package name - Custom label')
  .get('/package-json/name/badges/shields.json?label=Dev Name')
  .expectJSON({ name: 'Dev Name', value: 'gh-badges' });

t.create('Package array')
  .get('/package-json/keywords/badges/shields.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('package keywords'),
    value: Joi.string().regex(/.*?,/)
  }));

t.create('Package object')
  .get('/package-json/dependencies/badges/shields.json')
  .expectJSON({ name: 'package dependencies', value: 'invalid data' });

t.create('Manifest version')
  .get('/manifest-json/v/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'manifest',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('Manifest name')
  .get('/manifest-json/n/RedSparr0w/IndieGala-Helper.json')
  .expectJSON({ name: 'manifest name', value: 'IndieGala Helper' });

t.create('Manifest array')
  .get('/manifest-json/permissions/RedSparr0w/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'manifest permissions',
    value: Joi.string().regex(/.*?,/)
  }));

t.create('Manifest object')
  .get('/manifest-json/background/RedSparr0w/IndieGala-Helper.json')
  .expectJSON({ name: 'manifest background', value: 'invalid data' });

t.create('Manifest invalid json response')
  .get('/manifest-json/v/RedSparr0w/not-a-real-project.json')
  .expectJSON({ name: 'manifest', value: 'invalid data' });

t.create('Manifest no network connection')
  .get('/manifest-json/v/RedSparr0w/IndieGala-Helper.json')
  .networkOff()
  .expectJSON({ name: 'manifest', value: 'inaccessible' });

t.create('File size')
  .get('/size/webcaetano/craft/build/phaser-craft.min.js.json')
  .expectJSONTypes(Joi.object().keys({ name: 'size', value: isFileSize }));

t.create('File size 404')
  .get('/size/webcaetano/craft/build/does-not-exist.min.js.json')
  .expectJSON({ name: 'size', value: 'repo or file not found' });

t.create('File size for "not a regular file"')
  .get('/size/webcaetano/craft/build.json')
  .expectJSON({ name: 'size', value: 'not a regular file' });

t.create('Downloads all releases')
  .get('/downloads/photonstorm/phaser/total.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: Joi.string().regex(/^\w+\s+total$/)
  }));

t.create('downloads for release without slash')
  .get('/downloads/atom/atom/v0.190.0/total.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? v0\.190\.0$/)
  }));

t.create('downloads for specific asset without slash')
  .get('/downloads/atom/atom/v0.190.0/atom-amd64.deb.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? v0\.190\.0 \[atom-amd64\.deb\]$/)
  }));

t.create('downloads for release with slash')
  .get('/downloads/NHellFire/dban/stable/v2.2.8/total.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? stable\/v2\.2\.8$/)
  }));

t.create('downloads for specific asset with slash')
  .get('/downloads/NHellFire/dban/stable/v2.2.8/dban-2.2.8_i586.iso.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]? stable\/v2\.2\.8 \[dban-2\.2\.8_i586\.iso\]$/)
  }));

t.create('downloads for unknown release')
  .get('/downloads/atom/atom/does-not-exist/total.json')
  .expectJSON({ name: 'downloads', value: 'none' });

t.create('hit counter')
  .get('/search/torvalds/linux/goto.json')
  .expectJSONTypes(Joi.object().keys({ name: 'goto counter', value: isMetric }));

t.create('hit counter for nonexistent repo')
  .get('/search/torvalds/not-linux/goto.json')
  .expectJSON({ name: 'goto counter', value: 'repo not found' });

t.create('commit activity (1 year)')
  .get('/commit-activity/y/eslint/eslint.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('commit activity'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]?\/year$/),
  }));

t.create('commit activity (4 weeks)')
  .get('/commit-activity/4w/eslint/eslint.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('commit activity'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]?\/4 weeks$/),
  }));

t.create('commit activity (1 week)')
  .get('/commit-activity/w/eslint/eslint.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('commit activity'),
    value: Joi.string().regex(/^[0-9]+[kMGTPEZY]?\/week$/),
  }));

t.create('last commit (recent)')
  .get('/last-commit/eslint/eslint.json')
  .expectJSONTypes(Joi.object().keys({ name: 'last commit', value: isFormattedDate }));

t.create('last commit (ancient)')
  .get('/last-commit/badges/badgr.co.json')
  .expectJSON({ name: 'last commit', value: 'january 2014' });

t.create('last commit (on branch)')
  .get('/last-commit/badges/badgr.co/shielded.json')
  .expectJSON({ name: 'last commit', value: 'july 2013' });

t.create('github issue state')
  .get('/issues/detail/s/badges/shields/979.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'issue 979',
    value: Joi.equal('open', 'closed'),
  }));

t.create('github issue title')
  .get('/issues/detail/title/badges/shields/979.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'issue 979',
    value: 'Github rate limits cause transient service test failures in CI',
  }));

t.create('github issue author')
  .get('/issues/detail/u/badges/shields/979.json')
  .expectJSONTypes(Joi.object().keys({ name: 'author', value: 'paulmelnikow' }));

t.create('github issue label')
  .get('/issues/detail/label/badges/shields/979.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'label',
    value: Joi.equal('bug | developer-experience', 'developer-experience | bug'),
  }));

t.create('github issue comments')
  .get('/issues/detail/comments/badges/shields/979.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'comments',
    value: Joi.number().greater(15),
  }));

t.create('github issue age')
  .get('/issues/detail/age/badges/shields/979.json')
  .expectJSONTypes(Joi.object().keys({ name: 'created', value: isFormattedDate }));

t.create('github issue update')
  .get('/issues/detail/last-update/badges/shields/979.json')
  .expectJSONTypes(Joi.object().keys({ name: 'updated', value: isFormattedDate }));

t.create('github pull request check state')
  .get('/status/s/pulls/badges/shields/1110.json')
  .expectJSONTypes(Joi.object().keys({ name: 'checks', value: 'failure' }));

t.create('github pull request check contexts')
  .get('/status/contexts/pulls/badges/shields/1110.json')
  .expectJSONTypes(Joi.object().keys({ name: 'checks', value: '1 failure' }));
