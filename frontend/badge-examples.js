'use strict';

const url = require('url');
const React = require('react');

function resolveUri (uri, baseUri, options) {
  const { longCache } = options || {};
  const resolved = baseUri ? url.resolve(baseUri, uri) : uri;
  if (longCache) {
    const parsed = url.parse(resolved, true);
    parsed.query.maxAge = '2592000';
    // url.format will re-format `query`, but only When `search` is deleted.
    delete parsed.search;
    return url.format(parsed);
  } else {
    return resolved;
  }
}

const Badge = ({ title, previewUri, exampleUri, documentation, keywords, baseUri, isProductionBuild }) => {
  const attrs = {
    'data-doc': documentation,
    'data-keywords': keywords ? keywords.join(' ') : undefined,
  };
  const previewImage = previewUri
    ? (<img src={resolveUri(previewUri, baseUri, { longCache: isProductionBuild } )} alt="" />)
    : '\u00a0'; // non-breaking space
  const resolvedExampleUri = resolveUri(exampleUri || previewUri, baseUri || 'https://img.shields.io/', { longCache: false });

  return (
    <tr><th {... attrs}>{ title }:</th>
      <td>{ previewImage }</td>
      <td><code>{ resolvedExampleUri }</code></td>
    </tr>
  )
}

const Category = ({ category, examples, baseUri, isProductionBuild }) => (
  <div>
    <h3 id={category.id}>{ category.name }</h3>
    <table className='badge'><tbody>
      {
        examples.map((badgeData, i) => (<Badge key={i} {...badgeData} baseUri={baseUri} isProductionBuild={isProductionBuild} />))
      }
    </tbody></table>
  </div>
)

const BadgeExamples = ({ examples, baseUri, isProductionBuild }) => (
  <div>
    {
      examples.map((categoryData, i) => (<Category key={i} {...categoryData} baseUri={baseUri} isProductionBuild={isProductionBuild} />))
    }
  </div>
);

module.exports = BadgeExamples;
