'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const {
  isMetric,
  isFormattedDate,
} = require('../test-validators');

const t = new ServiceTester({ id: 'gitlab', title: 'Gitlab' });
module.exports = t;

t.create('Stars')
  .get('/stars/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'stars',
    value: isMetric
  }));

t.create('Forks')
  .get('/forks/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'forks',
    value: isMetric
  }));

t.create('Contributors')
  .get('/forks/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'contributors',
    value: isMetric
  }));

t.create('Build Status')
  .get('/build/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: Joi.string().regex(/^invalid|inaccessible|unknown|passed|running|canceled|failed$/)
  }));

t.create('Open Issues')
  .get('/issues-raw/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'open issues',
    value: isMetric
  }));

t.create('Closed Issues')
  .get('/issues-closed-raw/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'closed issues',
    value: isMetric
  }));

t.create('Open Merge Requests')
  .get('/merge-requests-raw/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'open merge requests',
    value: isMetric
  }));

t.create('Closed Merge Requests')
  .get('/merge-requests-closed-raw/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'closed merge requests',
    value: isMetric
  }));

t.create('Last Activity')
  .get('/merge-requests-closed-raw/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'last activity',
    value: isFormattedDate
  }));

t.create('Language Count')
  .get('/languages/gitlab-org/gitlab-ce.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'languages',
    value: isMetric
  }));
