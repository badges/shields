import {ServiceTester} from '../tester.js';

const t = (function() {
  export default __a;
}())

t.create('discourse status')
  .get('/https/meta.discourse.org/status.svg')
  .expectRedirect(
    `/discourse/status.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )

t.create('discourse topics')
  .get('/https/meta.discourse.org/topics.svg')
  .expectRedirect(
    `/discourse/topics.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )

t.create('discourse users')
  .get('/https/meta.discourse.org/users.svg')
  .expectRedirect(
    `/discourse/users.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )

t.create('discourse likes')
  .get('/https/meta.discourse.org/likes.svg')
  .expectRedirect(
    `/discourse/likes.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )

t.create('discourse posts')
  .get('/https/meta.discourse.org/posts.svg')
  .expectRedirect(
    `/discourse/posts.svg?server=${encodeURIComponent(
      'https://meta.discourse.org'
    )}`
  )
