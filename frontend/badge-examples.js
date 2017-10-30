'use strict';

const url = require('url');
// const URL = url.URL; // Requires Node 7+.
const { URL } = require('whatwg-url');
const React = require('react');

function resolvePreviewUri (uri, baseUri, isProductionBuild) {
  if (isProductionBuild) {
    const parsed = new URL(uri, baseUri);
    parsed.searchParams.set('maxAge', 2592000);
    return parsed.toString();
  } else {
    return uri;
  }
}

const Badge = ({ title, previewUri, exampleUri, documentation, keywords, baseUri, isProductionBuild }) => {
  const attrs = {
    'data-doc': documentation,
    'data-keywords': keywords ? keywords.join(' ') : undefined,
  };
  const previewImage = previewUri
    ? (<img src={resolvePreviewUri(previewUri, baseUri, isProductionBuild)} alt="" />)
    : '\u00a0'; // non-breaking space
  const resolvedExampleUri = url.resolve(baseUri, exampleUri || previewUri);

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
