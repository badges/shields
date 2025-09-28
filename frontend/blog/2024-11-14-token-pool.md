---
slug: token-pool
title: How shields.io uses the GitHub API
authors:
  name: chris48s
  title: Shields.io Core Team
  url: https://github.com/chris48s
  image_url: https://avatars.githubusercontent.com/u/6025893
tags: []
---

We serve a lot of badges which display information fetched from the GitHub API. When I say a lot, this varies a bit but in a typical hour we make hundreds of thousands of calls to the GitHub API.

But hang on. GitHub's API has rate limits.

Specifically, users can make up to [5,000 requests per hour](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#primary-rate-limit-for-authenticated-users) to GitHub's v3/REST API. The v4/GraphQL also applies rate limits, but it is based on a slightly more complicated [points-based system](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api#primary-rate-limit).

In any case, we are clearly making many times more requests to GitHub's API than would be allowed with a single token.

So how are we doing that? Well, we have lots of tokens. To elaborate on that slightly, as a user of shields.io you can choose to share a token with us to help increase our rate limit. Here's how it works:

- Authorize our [OAuth Application](https://img.shields.io/github-auth).
- This shares with us a GitHub token which has read-only access to public data. We only ask for the minimum permissions necessary. Authorizing the OAuth app doesn't allow us access to your private data or allow us to perform any actions on your behalf.
- Your token is added to a pool of tokens shared by other users like you.
- When we need to make a request to the GitHub API, we pick one of the tokens from our pool. We only make a handful of requests with each token before picking another from the pool.
- If you ever decide you would not like to continue sharing a token with us, you can revoke the Shields.io OAuth app at https://github.com/settings/applications. You can do this at any time. This will de-activate the token you have shared with us and we'll remove it from the pool.

This method allows us (with your help) to make hundreds of thousands of request per hour to the GitHub API. Because we have thousands of tokens in the pool and we only make a few requests with each one before picking another token from the pool, most users don't notice any meaningful impact on their available rate limit as a result of authorizing our app.
