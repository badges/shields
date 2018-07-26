'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const {
  isBuildStatus,
  isMetric,
  isMetricOpenIssues
} = require('../test-validators');
const { invalidJSON } = require('../response-fixtures');

const t = new ServiceTester({ id: 'bitbucket', title: 'Bitbucket badges' });
module.exports = t;


// tests for issues endpoints

t.create('issues-raw (valid)')
  .get('/issues-raw/atlassian/python-bitbucket.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'issues',
    value: isMetric
  }));

t.create('issues-raw (not found)')
  .get('/issues-raw/atlassian/not-a-repo.json')
  .expectJSON({ name: 'issues', value: 'not found' });

t.create('issues-raw (invalid)')
  .get('/issues-raw/chris48s/example-private-repo.json')
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

t.create('issues (not found)')
  .get('/issues/atlassian/not-a-repo.json')
  .expectJSON({ name: 'issues', value: 'not found' });

t.create('issues (invalid)')
  .get('/issues/chris48s/example-private-repo.json')
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

t.create('pr-raw (not found)')
  .get('/pr-raw/atlassian/not-a-repo.json')
  .expectJSON({ name: 'pull requests', value: 'not found' });

t.create('pr-raw (invalid)')
  .get('/pr-raw/chris48s/example-private-repo.json')
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

t.create('pr (not found)')
  .get('/pr/atlassian/not-a-repo.json')
  .expectJSON({ name: 'pull requests', value: 'not found' });

t.create('pr (invalid)')
  .get('/pr/chris48s/example-private-repo.json')
  .expectJSON({ name: 'pull requests', value: 'invalid' });

t.create('pr (connection error)')
  .get('/pr/atlassian/python-bitbucket.json')
  .networkOff()
  .expectJSON({ name: 'pull requests', value: 'inaccessible' });


// tests for Bitbucket Pipelines

function bitbucketApiResponse(status) {
  return JSON.stringify({
    "values": [
      {
        "state": {
          "type": "pipeline_state_completed",
          "name": "COMPLETED",
          "result": {
            "type": "pipeline_state_completed_xyz",
            "name": status
          }
        }
      }
    ]
  });
}

t.create('master build result (valid)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: isBuildStatus
  }));

t.create('master build result (not found)')
  .get('/pipelines/atlassian/not-a-repo.json')
  .expectJSON({ name: 'build', value: 'not found' })

t.create('branch build result (valid)')
  .get('/pipelines/atlassian/adf-builder-javascript/shields-test-dont-remove.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: isBuildStatus
  }));

t.create('branch build result (not found)')
  .get('/pipelines/atlassian/not-a-repo/some-branch.json')
  .expectJSON({ name: 'build', value: 'not found' })

t.create('branch build result (never built)')
  .get('/pipelines/atlassian/adf-builder-javascript/some/new/branch.json')
  .expectJSON({ name: 'build', value: 'never built' })

t.create('build result (passing)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock => nock('https://api.bitbucket.org')
    .get(/^\/2.0\/.*/)
    .reply(200, bitbucketApiResponse('SUCCESSFUL'))
  )
  .expectJSON({ name: 'build', value: 'passing' })

t.create('build result (failing)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock => nock('https://api.bitbucket.org')
    .get(/^\/2.0\/.*/)
    .reply(200, bitbucketApiResponse('FAILED'))
  )
  .expectJSON({ name: 'build', value: 'failing' })

t.create('build result (error)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock => nock('https://api.bitbucket.org')
    .get(/^\/2.0\/.*/)
    .reply(200, bitbucketApiResponse('ERROR'))
  )
  .expectJSON({ name: 'build', value: 'error' })

t.create('build result (stopped)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock => nock('https://api.bitbucket.org')
    .get(/^\/2.0\/.*/)
    .reply(200, bitbucketApiResponse('STOPPED'))
  )
  .expectJSON({ name: 'build', value: 'stopped' })

t.create('build result (expired)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock => nock('https://api.bitbucket.org')
    .get(/^\/2.0\/.*/)
    .reply(200, bitbucketApiResponse('EXPIRED'))
  )
  .expectJSON({ name: 'build', value: 'expired' })

t.create('build result (unknown)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock => nock('https://api.bitbucket.org')
    .get(/^\/2.0\/.*/)
    .reply(200, bitbucketApiResponse('NEW_AND_UNEXPECTED'))
  )
  .expectJSON({ name: 'build', value: 'unknown' })

t.create('build result (empty json)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock => nock('https://api.bitbucket.org')
    .get(/^\/2.0\/.*/)
    .reply(200, '{}')
  )
  .expectJSON({ name: 'build', value: 'invalid' })

t.create('build result (invalid json)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock => nock('https://api.bitbucket.org')
    .get(/^\/2.0\/.*/)
    .reply(invalidJSON)
  )
  .expectJSON({ name: 'build', value: 'invalid' })

t.create('build result (network error)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'inaccessible' });
