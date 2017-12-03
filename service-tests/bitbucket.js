'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isMetric,
  isMetricOpenIssues
} = require('./helpers/validators.js');

const t = new ServiceTester({ id: 'bitbucket', title: 'BitBucket badges' });
module.exports = t;


// tests for issues endpoints

t.create('issues-raw (valid)')
  .get('/issues-raw/atlassian/python-bitbucket.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'issues',
    value: isMetric
  }));

t.create('issues-raw (invalid)')
  .get('/issues-raw/atlassian/not-a-repo.json')
  .expectJSON({ name: 'issues', value: 'invalid' });

t.create('issues-raw (connection error)')
  .get('/issues-raw/atlassian/python-bitbucket.json')
  .networkOff()
  .expectJSON({ name: 'issues', value: 'inaccessible' });

t.create('issues (valid)')
  .get('/issues/atlassian/python-bitbucket.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'issues',
    value: isMetricOpenIssues
  }));

t.create('issues (invalid)')
  .get('/issues/atlassian/not-a-repo.json')
  .expectJSON({ name: 'issues', value: 'invalid' });

t.create('issues (connection error)')
  .get('/issues/atlassian/python-bitbucket.json')
  .networkOff()
  .expectJSON({ name: 'issues', value: 'inaccessible' });


// tests for pull requests endpoints

t.create('pr-raw (valid)')
  .get('/pr-raw/atlassian/python-bitbucket.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'pull requests',
    value: isMetric
  }));

t.create('pr-raw (invalid)')
  .get('/pr-raw/atlassian/not-a-repo.json')
  .expectJSON({ name: 'pull requests', value: 'invalid' });

t.create('pr-raw (connection error)')
  .get('/pr-raw/atlassian/python-bitbucket.json')
  .networkOff()
  .expectJSON({ name: 'pull requests', value: 'inaccessible' });

  t.create('pr (valid)')
  .get('/pr/atlassian/python-bitbucket.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'pull requests',
    value: isMetricOpenIssues
  }));

t.create('pr (invalid)')
  .get('/pr/atlassian/not-a-repo.json')
  .expectJSON({ name: 'pull requests', value: 'invalid' });

t.create('pr (connection error)')
  .get('/pr/atlassian/python-bitbucket.json')
  .networkOff()
  .expectJSON({ name: 'pull requests', value: 'inaccessible' });
