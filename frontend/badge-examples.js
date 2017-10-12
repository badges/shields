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
  const previewImage = props.previewBadgeUri
    ? (<img src={props.previewBadgeUri} alt="" />)
    : '\u00a0'; // non-breaking space
  return (
    <tr><th {... attrs}>{ props.title }</th>
      <td>{ previewImage }</td>
      <td><code>{ props.exampleBadgeUri }</code></td>
    </tr>
  )
}

const Section = (props) => (
  <div>
    <h3 id={props.sectionId}>{ props.sectionName }</h3>
    <table className='badge'><tbody>
      {
        props.badges.map((badgeData, i) => (<Badge key={i} {...badgeData} />))
      }
    </tbody></table>
  </div>
)

const BadgeExamples = (props) => (
  <div>
    {
      props.examples.map((sectionData, i) => (<Section key={i} {...sectionData} />))
    }
  </div>
);

module.exports = BadgeExamples;
