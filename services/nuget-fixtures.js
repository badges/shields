'use strict';

const queryIndex = JSON.stringify({
  "resources": [
    { "@id": "https://api-v2v3search-0.nuget.org/query", "@type": "SearchQueryService" }
  ]
});

const nuGetV2VersionJsonWithDash = JSON.stringify({
  d: {
    results: [
      { NormalizedVersion: '1.2-beta' }
    ]
  }
});
const nuGetV2VersionJsonFirstCharZero = JSON.stringify({
  d: {
    results: [
      { NormalizedVersion: '0.35' }
    ]
  }
});
const nuGetV2VersionJsonFirstCharNotZero = JSON.stringify({
  d: {
    results: [
      { NormalizedVersion: '1.2.7' }
    ]
  }
});

const nuGetV3VersionJsonWithDash = JSON.stringify({
  data: [
    {
      versions: [
        { version: '1.2-beta' }
      ]
    }
  ]
});
const nuGetV3VersionJsonFirstCharZero = JSON.stringify({
  data: [
    {
      versions: [
        { version: '0.35' }
      ]
    }
  ]
});
const nuGetV3VersionJsonFirstCharNotZero = JSON.stringify({
  data: [
    {
      versions: [
        { version: '1.2.7' }
      ]
    }
  ]
});

module.exports = {
  queryIndex,
  nuGetV2VersionJsonWithDash,
  nuGetV2VersionJsonFirstCharZero,
  nuGetV2VersionJsonFirstCharNotZero,
  nuGetV3VersionJsonWithDash,
  nuGetV3VersionJsonFirstCharZero,
  nuGetV3VersionJsonFirstCharNotZero,
};
