'use strict';

const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'discourse', title: 'Discourse' });
module.exports = t;

const data = {
  topic_count: 22513,
  post_count: 337719,
  user_count: 31220,
  topics_7_days: 143,
  topics_30_days: 551,
  posts_7_days: 2679,
  posts_30_days: 10445,
  users_7_days: 204,
  users_30_days: 803,
  active_users_7_days: 762,
  active_users_30_days: 1495,
  like_count: 308833,
  likes_7_days: 3633,
  likes_30_days: 13397
};

t.create('Topics')
  .get('/meta.discourse.org/topics.json')
  .intercept(nock => nock('https://meta.discourse.org')
    .get('/site/statistics.json')
    .reply(200, data)
  )
  .expectJSON({ name: 'discourse', value: '23k topics' });

t.create('Posts')
  .get('/meta.discourse.org/posts.json')
  .intercept(nock => nock('https://meta.discourse.org')
    .get('/site/statistics.json')
    .reply(200, data)
  )
  .expectJSON({ name: 'discourse', value: '338k posts' });

t.create('Users')
  .get('/meta.discourse.org/users.json')
  .intercept(nock => nock('https://meta.discourse.org')
    .get('/site/statistics.json')
    .reply(200, data)
  )
  .expectJSON({ name: 'discourse', value: '31k users' });

t.create('Likes')
  .get('/meta.discourse.org/likes.json')
  .intercept(nock => nock('https://meta.discourse.org')
    .get('/site/statistics.json')
    .reply(200, data)
  )
  .expectJSON({ name: 'discourse', value: '309k likes' });

t.create('Status')
  .get('/meta.discourse.org/status.json')
  .intercept(nock => nock('https://meta.discourse.org')
    .get('/site/statistics.json')
    .reply(200, data)
  )
  .expectJSON({ name: 'discourse', value: 'online' });

t.create('Invalid Host')
  .get('/some.host/status.json')
  .intercept(nock => nock('https://some.host')
    .get('/site/statistics.json')
    .reply(404, "<h1>Not Found</h1>")
  )
  .expectJSON({ name: 'discourse', value: 'offline' });

t.create('Invalid Stat')
  .get('/meta.discourse.org/unknown.json')
  .intercept(nock => nock('https://meta.discourse.org')
    .get('/site/statistics.json')
    .reply(200, data)
  )
  .expectJSON({ name: 'discourse', value: 'invalid' });

t.create('Connection Error')
  .get('/meta.discourse.org/status.json')
  .networkOff()
  .expectJSON({ name: 'discourse', value: 'invalid' });