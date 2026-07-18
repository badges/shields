import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import RedditBase from './reddit-base.js'
import RedditSubredditSubscribers from './subreddit-subscribers.service.js'

describe('RedditBase', function () {
  cleanUpNockAfterEach()

  const clientId = 'client-id'
  const clientSecret = 'client-secret'
  const token = 'access-token'
  const config = {
    private: {
      reddit_client_id: clientId,
      reddit_client_secret: clientSecret,
    },
  }

  afterEach(function () {
    RedditBase._redditToken = undefined
  })

  it('requests an OAuth token with form-encoded client credentials', async function () {
    const tokenNock = nock('https://www.reddit.com', {
      reqheaders: {
        authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
    })
      .post('/api/v1/access_token', { grant_type: 'client_credentials' })
      .matchHeader(
        'content-type',
        'application/x-www-form-urlencoded;charset=UTF-8',
      )
      .reply(200, { access_token: token, expires_in: 3600 })

    const apiNock = nock('https://oauth.reddit.com', {
      reqheaders: { authorization: `Bearer ${token}` },
    })
      .get('/r/drums/about.json')
      .reply(200, { data: { subscribers: 123 } })

    expect(
      await RedditSubredditSubscribers.invoke(defaultContext, config, {
        subreddit: 'drums',
      }),
    ).to.deep.equal({
      label: 'follow r/drums',
      message: '123',
      style: 'social',
      color: 'red',
      link: ['https://www.reddit.com/r/drums'],
    })

    tokenNock.done()
    apiNock.done()
  })
})
