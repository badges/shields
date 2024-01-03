---
slug: new-frontend
title: We launched a new frontend
authors:
  name: chris48s
  title: Shields.io Core Team
  url: https://github.com/chris48s
  image_url: https://avatars.githubusercontent.com/u/6025893
tags: []
---

Alongside the general visual refresh and improvements to look and feel, our new frontend has allowed us to address a number of long-standing feature requests and enhancements:

- Clearer and more discoverable documentation for our [static](https://shields.io/badges/static-badge), dynamic [json](https://shields.io/badges/dynamic-json-badge)/[xml](https://shields.io/badges/dynamic-xml-badge)/[yaml](https://shields.io/badges/dynamic-yaml-badge) and [endpoint](https://shields.io/badges/endpoint-badge) badges
- Improved badge builder interface, with all optional query parameters included in the builder for each badge
- Each badge now has its own documentation page, which we can link to. e.g: [https://shields.io/badges/discord](https://shields.io/badges/discord)
- Light/dark mode themes
- Improved search
- Documentation for individual path and query parameters

The new site also comes with big maintenance benefits for the core team. We rely heavily on [docusaurus](https://docusaurus.io/), [docusaurus-openapi](https://github.com/cloud-annotations/docusaurus-openapi), and [docusaurus-search-local](https://github.com/easyops-cn/docusaurus-search-local). This moves us to a mostly declarative setup, massively reducing the amount of custom frontend code we maintain ourselves.
