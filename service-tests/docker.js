'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const { isMetric } = require('./helpers/validators.js');
const isAutomatedBuildStatus = Joi.string().valid('automated', 'manual');
const isBuildStatus = Joi.string().regex(/^(passing|failing|building)$/);

const t = new ServiceTester({ id: 'docker', title: 'Docker Hub' });
module.exports = t;


// stars endpoint

t.create('docker stars (valid, library)')
  .get('/stars/_/ubuntu.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docker stars',
    value: isMetric
  }));

t.create('docker stars (valid, user)')
  .get('/stars/jrottenberg/ffmpeg.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docker stars',
    value: isMetric
  }));

t.create('docker stars (not found)')
  .get('/stars/_/not-a-real-repo.json')
  .expectJSON({name: 'docker stars', value: 'repo not found'});

t.create('docker stars (connection error)')
  .get('/stars/_/ubuntu.json')
  .networkOff()
  .expectJSON({name: 'docker stars', value: 'inaccessible'});

t.create('docker stars (unexpected response)')
  .get('/stars/_/ubuntu.json')
  .intercept(nock => nock('https://hub.docker.com/')
    .get('/v2/repositories/library/ubuntu/stars/count/')
    .reply(200, "some kind of error")
  )
  .expectJSON({name: 'docker stars', value: 'invalid'});


// pulls endpoint

t.create('docker pulls (valid, library)')
  .get('/pulls/_/ubuntu.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docker pulls',
    value: isMetric
  }));

t.create('docker pulls (valid, user)')
  .get('/pulls/jrottenberg/ffmpeg.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docker pulls',
    value: isMetric
  }));

t.create('docker pulls (not found)')
  .get('/pulls/_/not-a-real-repo.json')
  .expectJSON({name: 'docker pulls', value: 'repo not found'});

t.create('docker pulls (connection error)')
  .get('/pulls/_/ubuntu.json')
  .networkOff()
  .expectJSON({name: 'docker pulls', value: 'inaccessible'});

t.create('docker pulls (unexpected response)')
  .get('/pulls/_/ubuntu.json')
  .intercept(nock => nock('https://hub.docker.com/')
    .get('/v2/repositories/library/ubuntu')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'docker pulls', value: 'invalid'});


// automated build endpoint

t.create('docker automated build (valid, library)')
  .get('/automated/_/ubuntu.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docker build',
    value: isAutomatedBuildStatus
  }));

t.create('docker automated build (valid, user)')
  .get('/automated/jrottenberg/ffmpeg.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docker build',
    value: isAutomatedBuildStatus
  }));

t.create('docker automated build (not found)')
  .get('/automated/_/not-a-real-repo.json')
  .expectJSON({name: 'docker build', value: 'repo not found'});

t.create('docker automated build (connection error)')
  .get('/automated/_/ubuntu.json')
  .networkOff()
  .expectJSON({name: 'docker build', value: 'inaccessible'});

t.create('docker automated build (unexpected response)')
  .get('/automated/_/ubuntu.json')
  .intercept(nock => nock('https://registry.hub.docker.com/')
    .get('/v2/repositories/library/ubuntu')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'docker build', value: 'invalid'});


// build status endpoint

t.create('docker build status (valid, user)')
  .get('/build/jrottenberg/ffmpeg.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docker build',
    value: isBuildStatus
  }));

t.create('docker build status (not found)')
  .get('/build/_/not-a-real-repo.json')
  .expectJSON({name: 'docker build', value: 'repo not found'});

t.create('docker build status (connection error)')
  .get('/build/_/ubuntu.json')
  .networkOff()
  .expectJSON({name: 'docker build', value: 'inaccessible'});

t.create('docker build status (unexpected response)')
  .get('/build/_/ubuntu.json')
  .intercept(nock => nock('https://registry.hub.docker.com/')
    .get('/v2/repositories/library/ubuntu/buildhistory')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'docker build', value: 'invalid'});
