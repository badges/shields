---
slug: tag-filter
title: Applying filters to GitHub Tag and Release badges
authors:
  name: chris48s
  title: Shields.io Core Team
  url: https://github.com/chris48s
  image_url: https://avatars.githubusercontent.com/u/6025893
tags: []
---

We recently shipped a feature which allows you to pass an arbitrary filter to the GitHub tag and release badges. The `filter` param can be used to apply a filter to the project's tag or release names before selecting the latest from the list. Two constructs are available: `*` is a wildcard matching zero or more characters, and if the pattern starts with a `!`, the whole pattern is negated.

To give an example of how this might be useful, we create two types of tags on our GitHub repo: https://github.com/badges/shields/tags There are tags in the format `major.minor.patch` which correspond to our [NPM package releases](https://www.npmjs.com/package/badge-maker?activeTab=versions) and tags in the format `server-YYYY-MM-DD` that correspond to our [docker snapshot releases](https://registry.hub.docker.com/r/shieldsio/shields/tags?page=1&ordering=last_updated).

In our case, this would allow us to make a badge that applies the filter `!server-*` to filter out the snapshot tags and just select the latest package tag.

- ![tag badge without filter](https://img.shields.io/github/v/tag/badges/shields) - https://img.shields.io/github/v/tag/badges/shields
- ![tag badge with filter](https://img.shields.io/github/v/tag/badges/shields?filter=%21server-%2A) - https://img.shields.io/github/v/tag/badges/shields?filter=%21server-%2A
