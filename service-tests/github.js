'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'github', title: 'Github' });
module.exports = t;

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

// pull request state

t.create('Pull request state, regular case')
  .get('/pr-state/badges/shields/578.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('pull request state'),
    value: Joi.equal('closed', 'merged', 'mergeable', 'has conflicts', 'need rebase')
  }));

t.create('Pull request state, closed pull request')
  .get('/pr-state/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578')
      .query(true)
      .reply(200, {
        mergeable: null,
        mergeable_state: 'unknown',
        merged: false,
        state: 'closed'
      })
  )
  .expectJSON({
    name: 'pull request state',
    value: 'closed'
  });

t.create('Pull request state, merged pull request')
  .get('/pr-state/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578')
      .query(true)
      .reply(200, {
        mergeable: null,
        mergeable_state: 'unknown',
        merged: true,
        state: 'closed'
      })
  )
  .expectJSON({
    name: 'pull request state',
    value: 'merged'
  });

t.create('Pull request state, pull request with unknown state')
  .get('/pr-state/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578')
      .query(true)
      .reply(200, {
        mergeable: null,
        mergeable_state: 'unknown',
        merged: false,
        state: 'open'
      })
  )
  .expectJSON({
    name: 'pull request state',
    value: 'unknown'
  });

t.create('Pull request state, mergeable pull request')
  .get('/pr-state/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578')
      .query(true)
      .reply(200, {
        mergeable: true,
        mergeable_state: 'clean',
        merged: false,
        state: 'open'
      })
  )
  .expectJSON({
    name: 'pull request state',
    value: 'mergeable'
  });

t.create('Pull request state, pull request with conflicts')
  .get('/pr-state/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578')
      .query(true)
      .reply(200, {
        mergeable: false,
        mergeable_state: 'dirty',
        merged: false,
        state: 'open'
      })
  )
  .expectJSON({
    name: 'pull request state',
    value: 'has conflicts'
  });

t.create('Pull request state, pull request that needs rebase')
  .get('/pr-state/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578')
      .query(true)
      .reply(200, {
        mergeable: false,
        mergeable_state: 'behind',
        merged: false,
        state: 'open'
      })
  )
  .expectJSON({
    name: 'pull request state',
    value: 'need rebase'
  });

t.create('Pull request state, mergeable pull request but build unstable')
  .get('/pr-state/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578')
      .query(true)
      .reply(200, {
        mergeable: true,
        mergeable_state: 'unstable',
        merged: false,
        state: 'open'
      })
  )
  .expectJSON({
    name: 'pull request state',
    value: 'unstable'
  });

t.create('Pull request state, valid response but not a Github issue')
  .get('/pr-state/badges/shields/-1.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('pull request state'),
    value: Joi.equal('inaccessible')
  }));

t.create('Pull request state, invalid response')
  .get('/pr-state/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578')
      .query(true)
      .reply(200, 'This should be JSON')
  )
  .expectJSON({
    name: 'pull request state',
    value: 'inaccessible'
  });

t.create('Pull request state, request error')
  .get('/pr-state/badges/shields/578.json')
  .networkOff()
  .expectJSON({
    name: 'pull request state',
    value: 'inaccessible'
  });

// pull request review

t.create('Pull request review, no requested reviewer')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/reviews')
      .query(true)
      .reply(200, [])
  )
  .expectJSON({
    name: 'pull request review',
    value: 'none'
  });

t.create('Pull request review, one pending requested reviewer')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [{login: 'bob'}])
  )
  .expectJSON({
    name: 'pull request review',
    value: 'pending'
  });

t.create('Pull request review, 1 review, 1 approved')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/reviews')
      .query(true)
      .reply(200, [{state: 'APPROVED', user: {login: 'bob'}}])
  )
  .expectJSON({
    name: 'pull request review',
    value: 'approved'
  });

t.create('Pull request review, 1 review, 1 changes requested')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/reviews')
      .query(true)
      .reply(200, [
        {state: 'CHANGES_REQUESTED', user: {login: 'bob'}}
      ])
  )
  .expectJSON({
    name: 'pull request review',
    value: 'need changes'
  });

t.create('Pull request review, 1 review, 1 comment')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/reviews')
      .query(true)
      .reply(200, [
        {state: 'COMMENT', user: {login: 'bob'}}
      ])
  )
  .expectJSON({
    name: 'pull request review',
    value: 'pending'
  });

t.create('Pull request review, 2 reviews, 1 user, 1 comment then 1 approved')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/reviews')
      .query(true)
      .reply(200, [
        {state: 'COMMENT', user: {login: 'bob'}},
        {state: 'APPROVED', user: {login: 'bob'}}
      ])
  )
  .expectJSON({
    name: 'pull request review',
    value: 'approved'
  });

t.create('Pull request review, 2 reviews, 1 user, 1 changes requested then 1 approved')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/reviews')
      .query(true)
      .reply(200, [
        {state: 'CHANGES_REQUESTED', user: {login: 'bob'}},
        {state: 'APPROVED', user: {login: 'bob'}}
      ])
  )
  .expectJSON({
    name: 'pull request review',
    value: 'approved'
  });

t.create('Pull request review, 2 reviews, 2 users, 1 comment and 1 approved')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/reviews')
      .query(true)
      .reply(200, [
        {state: 'COMMENT', user: {login: 'bob'}},
        {state: 'APPROVED', user: {login: 'henri'}}
      ])
  )
  .expectJSON({
    name: 'pull request review',
    value: 'approved'
  });

t.create('Pull request review, 2 reviews, 2 users, 1 changes requested and 1 approved')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/reviews')
      .query(true)
      .reply(200, [
        {state: 'CHANGES_REQUESTED', user: {login: 'bob'}},
        {state: 'APPROVED', user: {login: 'henri'}}
      ])
  )
  .expectJSON({
    name: 'pull request review',
    value: 'need changes'
  });

t.create('Pull request review, first request error')
  .get('/pr-review/badges/shields/578.json')
  .networkOff()
  .expectJSON({
    name: 'pull request review',
    value: 'inaccessible'
  });

t.create('Pull request review, first request ok, second request error')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .networkOff()
  .expectJSON({
    name: 'pull request review',
    value: 'inaccessible'
  });

t.create('Pull request review, invalid response on first request')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, 'unparsable text')
  )
  .expectJSON({
    name: 'pull request review',
    value: 'inaccessible'
  });

t.create('Pull request review, invalid response on second request')
  .get('/pr-review/badges/shields/578.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/requested_reviewers')
      .query(true)
      .reply(200, [])
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get('/repos/badges/shields/pulls/578/reviews')
      .query(true)
      .reply(200, 'unparsable text')
  )
  .expectJSON({
    name: 'pull request review',
    value: 'inaccessible'
  });
