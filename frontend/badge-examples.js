'use strict';

const React = require('react');

const Badge = (props) => {
  const attrs = {};
  if (props.documentation) {
    attrs['data-doc'] = props.documentation;
  }
  if (props.keywords) {
    attrs['data-keywords'] = props.keywords.join(' ');
  }
  const previewImage = props.previewUri
    ? (<img src={props.previewUri} alt="" />)
    : '\u00a0'; // non-breaking space
  const exampleUri = `https://img.shields.io${props.exampleUri || props.previewUri}`;

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
        props.examples.map((badgeData, i) => (<Badge key={i} {...badgeData} />))
      }
    </tbody></table>
  </div>
)

const BadgeExamples = (props) => (
  <div>
    {
      props.examples.map((categoryData, i) => (<Category key={i} {...categoryData} />))
    }
  </div>
);

module.exports = BadgeExamples;
