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

const Badge = (props) => {
  const attrs = {};
  if (props.documentation) {
    attrs['data-doc'] = props.documentation;
  }
  if (props.keywords) {
    attrs['data-keywords'] = props.keywords.join(' ');
  }
  const previewImage = props.previewUri
    ? (<img src={resolvePreviewUri(props.previewUri, props.baseUri, props.isProductionBuild)} alt="" />)
    : '\u00a0'; // non-breaking space
  const exampleUri = url.resolve(props.baseUri, props.exampleUri || props.previewUri);

  return (
    <tr><th {... attrs}>{ props.title }:</th>
      <td>{ previewImage }</td>
      <td><code>{ exampleUri }</code></td>
    </tr>
  )
}

const Category = (props) => (
  <div>
    <h3 id={props.category.id}>{ props.category.name }</h3>
    <table className='badge'><tbody>
      {
        props.examples.map((badgeData, i) => (<Badge key={i} {...badgeData} baseUri={props.baseUri} isProductionBuild={props.isProductionBuild} />))
      }
    </tbody></table>
  </div>
)

const BadgeExamples = (props) => (
  <div>
    {
      props.examples.map((categoryData, i) => (<Category key={i} {...categoryData} baseUri={props.baseUri} isProductionBuild={props.isProductionBuild} />))
    }
  </div>
);

module.exports = BadgeExamples;
