import { Fragment, default as React } from 'react';
import PropTypes from 'prop-types';
import StaticBadgeMaker from './static-badge-maker';
import DynamicBadgeMaker from './dynamic-badge-maker';
import JsonBadgeMaker from './json-badge-maker';
import { staticBadgeUrl } from '../lib/badge-url';
import { advertisedStyles } from '../../lib/supported-features';

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

  render () {
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

        <p>Where color is one of these named colors, or hex (xxxxxx)
        </p>
        { this.renderColorExamples() }

        <hr />

        <h3 id="badge-json">Badge JSON</h3>

        <p>Your service/website can speak badge by serving badge-json</p>

        <JsonBadgeMaker baseUri={baseUri} />

        <p>
          <code>
            {baseUri}/json/&lt;URL&gt;.svg
          </code>
        </p>

        <table>
          <tbody>
            <tr>
              <td style={{verticalAlign:'top'}}><code>&lt;URL&gt;</code></td>
              <td>
                URL that provides badge-json<br />
                must be url-encoded (above tool will url-encode for you)
              </td>
            </tr>
          </tbody>
        </table>

        <p>badge-json is a simple object with the following properties/values.<br />
          All Values are optional except for <code>label</code> and <code>value</code>
        </p>

        <table>
          <caption>Properties specified in JSON (* = required)</caption>
          <tbody>
            <tr>
              <td><code>label</code> *</td>
              <td>left-hand-side text</td>
            </tr>
            <tr>
              <td><code>value</code> *</td>
              <td>right-hand-side text</td>
            </tr>
            <tr>
              <td><code>valueClass</code></td>
              <td>one of &quot;error&quot;, &quot;notice&quot;, &quot;success&quot;, &quot;info&quot;, or &quot;default&quot;</td>
            </tr>
            <tr>
              <td><code>isSocial</code></td>
              <td>(boolean) default = <code>false</code>.  If true, will get &quot;social&quot; style by default</td>
            </tr>
            <tr>
              <td style={{verticalAlign:'top'}}><code>logo</code></td>
              <td>
                one of:
                <ul>
                  <li><a href="https://github.com/badges/shields/tree/gh-pages/logo">named logo</a></li>
                  <li>data-uri: <code>data:image/png;base64,…</code></li>
                </ul>
              </td>
            </tr>
            <tr>
              <td><code>logoWidth</code></td>
              <td>Set the horizontal space to give to the logo</td>
            </tr>
            <tr>
              <td><code>colorA</code></td>
              <td>background color of the left part (overrides <code>valueClass</code> color scheme)</td>
            </tr>
            <tr>
              <td><code>colorB</code></td>
              <td>background color of the right part (overrides <code>valueClass</code> color scheme)</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h3 id="dynamic-badge">Dynamic</h3>

        <DynamicBadgeMaker baseUri={baseUri} />

        <p>
          <code>/badge/dynamic/&lt;TYPE&gt;.svg?uri=&lt;URI&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;<a href="https://www.npmjs.com/package/jsonpath" target="_BLANK" title="JSONdata syntax">$.DATA.SUBDATA</a>&gt;&amp;colorB=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;</code>
        </p>

        <table>
          <caption>Notes</caption>
          <tbody>
            <tr>
              <td style={{verticalAlign:'top'}}><code>query</code></td>
              <td>
                Path to value in the json.<br />
                (see <a href="https://www.npmjs.com/package/jsonpath">https://www.npmjs.com/package/jsonpath</a>)
              </td>
            </tr>
            <tr>
              <td><code>prefix</code></td>
              <td>prepended to value</td>
            </tr>
            <tr>
              <td><code>suffix</code></td>
              <td>appended to value</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2 id="parameters">Parameters</h2>

        <p>
          All badges accept optional parameters: (connecting several with "&" is possible)
        </p>
        <table>
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
                Insert one of the {}
                <a href="https://github.com/badges/shields/tree/gh-pages/logo">named logos</a>
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
              <td>Set background of the left part (hex color only)</td>
            </tr>
            <tr>
              <td>
                <code>?colorB=fedcba</code>
              </td>
              <td>Set background of the right part (hex color only)</td>
            </tr>
            <tr>
              <td>
                <code>?maxAge=3600</code>
              </td>
              <td>Set the HTTP cache lifetime in secs</td>
            </tr>
            <tr>
              <td style={{verticalAlign:'top'}}>
                <code>?style=flat</code>
              </td>
              <td>
                Specify the badge style.<br />
                One of : &quot;plastic&quot;, &quot;flat&quot;, &quot;flat-square&quot;, &quot;for-the-badge&quot;, or &quot;social&quot;
              </td>
            </tr>
          </tbody>
        </table>

        <h3 id="styles">Styles</h3>

        <p>
          The following styles are available (flat is the default as of Feb 1st 2015):
        </p>
        { this.renderStyleExamples() }

        <hr className="spacing" />

        <p>
          We support <code>.svg</code>, <code>.json</code>, <code>.png</code> and a
          few others, but use them responsibly.
        </p>
      </section>
    );
  }
}
