import { Fragment, default as React } from 'react';
import PropTypes from 'prop-types';
import StaticBadgeMaker from './static-badge-maker';
import DynamicBadgeMaker from './dynamic-badge-maker';
import { staticBadgeUrl } from '../lib/badge-url';
import { advertisedStyles, logos } from '../../supported-features.json';

export default class Usage extends React.PureComponent {
  static propTypes = {
    baseUri: PropTypes.string.isRequired,
    longCache: PropTypes.bool.isRequired,
  };

  renderColorExamples () {
    const { baseUri, longCache } = this.props;
    const colors = [
      'brightgreen',
      'green',
      'yellowgreen',
      'yellow',
      'orange',
      'red',
      'lightgrey',
      'blue',
      'ff69b4',
    ];
    return (
      <p>
        { colors.map((color, i) => (
          <Fragment key={i}>
            <img
              className="badge-img"
              src={staticBadgeUrl(baseUri, 'color', color, color, { longCache })}
              alt={color} /> {}
          </Fragment>
        ))}
      </p>
    );
  }

  renderStyleExamples () {
    const { baseUri, longCache } = this.props;
    return (
      <table className="badge-img">
        <tbody>
          { advertisedStyles.map((style, i) => {
            const badgeUri = staticBadgeUrl(
              baseUri,
              'style',
              style,
              'green',
              { longCache, style });
            return (
              <tr key={i}>
                <td>
                  <img className="badge-img" src={badgeUri} alt={style} />
                </td>
                <td>
                  <code>{badgeUri}</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  static renderNamedLogos() {
    const renderLogo = logo => <span className="nowrap">{logo}</span>;
    const [first, ...rest] = logos;
    return [renderLogo(first)].concat(
      rest.reduce((result, logo) => result.concat([', ', renderLogo(logo)]), [])
    );
  }

  render() {
    const { baseUri } = this.props;
    return (
      <section>
        <h2 id="your-badge">Your Badge</h2>

        <h3 id="static-badge">Static</h3>
        <StaticBadgeMaker baseUri={baseUri} />

        <hr className="spacing" />

        <p>
          <code>
            {baseUri}/badge/&lt;SUBJECT&gt;-&lt;STATUS&gt;-&lt;COLOR&gt;.svg
          </code>
        </p>
        <table className="centered">
          <tbody>
            <tr>
              <td>
                Dashes <code>--</code>
              </td>
              <td>→</td>
              <td>
                <code>-</code> Dash
              </td>
            </tr>
            <tr>
              <td>
                Underscores <code>__</code>
              </td>
              <td>→</td>
              <td>
                <code>_</code> Underscore
              </td>
            </tr>
            <tr>
              <td>
                <code>_</code> or Space <code>&nbsp;</code>
              </td>
              <td>→</td>
              <td>
                <code>&nbsp;</code> Space
              </td>
            </tr>
          </tbody>
        </table>

        { this.renderColorExamples() }

        <h3 id="dynamic-badge">Dynamic</h3>

        <DynamicBadgeMaker baseUri={baseUri} />

        <p>
          <code>/badge/dynamic/json.svg?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;<a href="https://www.npmjs.com/package/jsonpath" target="_BLANK" title="JSONdata syntax">$.DATA.SUBDATA</a>&gt;&amp;colorB=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;</code>
        </p>
        <p>
          <code>/badge/dynamic/xml.svg?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;<a href="https://www.npmjs.com/package/xpath" target="_BLANK" title="XPath syntax">//data/subdata</a>&gt;&amp;colorB=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;</code>
        </p>
        <p>
          <code>/badge/dynamic/yaml.svg?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;<a href="https://www.npmjs.com/package/jsonpath" target="_BLANK" title="JSONdata syntax">$.DATA.SUBDATA</a>&gt;&amp;colorB=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;</code>
        </p>

        <hr className="spacing" />

        <h2 id="styles">Styles</h2>

        <p>
          The following styles are available (flat is the default as of Feb 1st 2015):
        </p>
        { this.renderStyleExamples() }

        <p>
          Here are a few other parameters you can use: (connecting several with "&" is possible)
        </p>
        <table className="usage">
          <tbody>
            <tr>
              <td>
                <code>?label=healthinesses</code>
              </td>
              <td>
                Override the default left-hand-side text (
                <a href="https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding">
                  URL-Encoding
                </a>
                {} needed for spaces or special characters!)
              </td>
            </tr>
            <tr>
              <td>
                <code>?logo=appveyor</code>
              </td>
              <td>
                Insert one of the named logos ({this.constructor.renderNamedLogos()})
              </td>
            </tr>
            <tr>
              <td>
                <code>?logo=data:image/png;base64,…</code>
              </td>
              <td>Insert custom logo image (≥ 14px high)</td>
            </tr>
            <tr>
              <td>
                <code>?logoWidth=40</code>
              </td>
              <td>Set the horizontal space to give to the logo</td>
            </tr>
            <tr>
              <td>
                <code>?link=http://left&amp;link=http://right</code>
              </td>
              <td>
                Specify what clicking on the left/right of a badge should do (esp.
                for social badge style)
              </td>
            </tr>
            <tr>
              <td>
                <code>?colorA=abcdef</code>
              </td>
              <td>Set background of the left part (hex, rgb, rgba, hsl, hsla and css named colors supported)</td>
            </tr>
            <tr>
              <td>
                <code>?colorB=fedcba</code>
              </td>
              <td>Set background of the right part (hex, rgb, rgba, hsl, hsla and css named colors supported)</td>
            </tr>
            <tr>
              <td>
                <code>?maxAge=3600</code>
              </td>
              <td>Set the HTTP cache lifetime in secs (values below the default will be ignored)</td>
            </tr>
          </tbody>
        </table>

        <p>
          We support <code>.svg</code>, <code>.json</code>, <code>.png</code> and a
          few others, but use them responsibly.
        </p>
      </section>
    );
  }
}
