import React from 'react';
import PropTypes from 'prop-types';
import StaticBadgeMaker from './static-badge-maker';
import DynamicBadgeMaker from './dynamic-badge-maker';

const Usage = ({ baseUri }) => (
  <section>
    <h2 id="your-badge">Your Badge</h2>

    <h3 id="static-badge">Static</h3>
    <StaticBadgeMaker baseUri={baseUri} />

    <hr className="spacing" />

    <p>
      <code><span id="imgUrlPrefix">/badge/</span>&lt;SUBJECT&gt;-&lt;STATUS&gt;-&lt;COLOR&gt;.svg</code>
    </p>
    <table className="centered"><tbody>
      <tr><td>   Dashes <code>--</code>
      </td><td>  →
      </td><td>  <code>-</code> Dash
      </td></tr>
      <tr><td>   Underscores <code>__</code>
      </td><td>  →
      </td><td>  <code>_</code> Underscore <br />
      </td></tr>
      <tr><td>   <code>_</code> or Space <code>&nbsp;</code>
      </td><td>  →
      </td><td>  <code>&nbsp;</code> Space
      </td></tr>
    </tbody></table>

    <p className="badge-img">
      <img src={baseUri + "/badge/color-brightgreen-brightgreen.svg"} alt="brightgreen" />
      <img src={baseUri + "/badge/color-green-green.svg"} alt="green" />
      <img src={baseUri + "/badge/color-yellowgreen-yellowgreen.svg"} alt="yellowgreen" />
      <img src={baseUri + "/badge/color-yellow-yellow.svg"} alt="yellow" />
      <img src={baseUri + "/badge/color-orange-orange.svg"} alt="orange" />
      <img src={baseUri + "/badge/color-red-red.svg"} alt="red" />
      <img src={baseUri + "/badge/color-lightgrey-lightgrey.svg"} alt="lightgrey" />
      <img src={baseUri + "/badge/color-blue-blue.svg"} alt="blue" />
      <img src={baseUri + "/badge/color-ff69b4-ff69b4.svg"} alt="ff69b4" />
    </p>

    <h3 id="dynamic-badge">Dynamic</h3>

    <DynamicBadgeMaker baseUri={baseUri} />

    <p>
      <code>/badge/dynamic/&lt;TYPE&gt;.svg?uri=&lt;URI&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;<a href="https://www.npmjs.com/package/jsonpath" target="_BLANK" title="JSONdata syntax">$.DATA.SUBDATA</a>&gt;&amp;colorB=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;</code>
    </p>

    <hr className="spacing" />

    <h2 id="styles">Styles</h2>

    <p>
      The following styles are available (flat is the default as of Feb 1st 2015):
    </p>
    <table className="badge-img"><tbody>
      <tr>
        <td><img src={baseUri + "/badge/style-plastic-green.svg?style=plastic"} alt="" /></td>
        <td><code>https://img.shields.io/badge/style-plastic-green.svg?style=plastic</code></td>
      </tr>
      <tr>
        <td><img src={baseUri + "/badge/style-flat-green.svg?style=flat"} alt="" /></td>
        <td><code>https://img.shields.io/badge/style-flat-green.svg?style=flat</code></td>
      </tr>
      <tr>
        <td><img src={baseUri + "/badge/style-flat--square-green.svg?style=flat-square"} alt="" /></td>
        <td><code>https://img.shields.io/badge/style-flat--square-green.svg?style=flat-square</code></td>
      </tr>
      <tr>
        <td><img src={baseUri + "/badge/style-for--the--badge-green.svg?style=for-the-badge"} alt="" /></td>
        <td><code>https://img.shields.io/badge/style-for--the--badge-green.svg?style=for-the-badge</code></td>
      </tr>
      <tr>
        <td><img src={baseUri + "/badge/style-social-green.svg?style=social"} alt="" /></td>
        <td><code>https://img.shields.io/badge/style-social-green.svg?style=social</code></td>
      </tr>
    </tbody></table>

    <p>
      Here are a few other parameters you can use: (connecting several with "&" is possible)
    </p>
    <table><tbody>
      <tr><td><code>?label=healthinesses</code></td><td>Override the default
          left-hand-side text (<a href="https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding">URL-Encoding</a> needed for spaces or special characters!)</td></tr>
      <tr><td><code>?logo=appveyor</code></td>
        <td>
          Insert one of
          the <a href="https://github.com/badges/shields/tree/gh-pages/logo">named logos</a>
        </td></tr>
      <tr><td><code>?logo=data:image/png;base64,…</code></td>
        <td>Insert custom logo image (≥ 14px high)</td></tr>
      <tr><td><code>?logoWidth=40</code></td>
        <td>Set the horizontal space to give to the logo</td></tr>
      <tr><td><code>?link=http://left&amp;link=http://right</code></td>
        <td>Specify what clicking on the left/right of a badge should do (esp. for
          social badge style)</td></tr>
      <tr><td><code>?colorA=abcdef</code></td>
        <td>Set background of the left part (hex color only)</td></tr>
      <tr><td><code>?colorB=fedcba</code></td>
        <td>Set background of the right part (hex color only)</td></tr>
      <tr><td><code>?maxAge=3600</code></td>
        <td>Set the HTTP cache lifetime in secs</td></tr>
    </tbody></table>

    <p>
      We support <code>.svg</code>, <code>.json</code>, <code>.png</code> and a few
      others, but use them responsibly.
    </p>
  </section>
);
export default Usage;
Usage.propTypes = {
  baseUri: PropTypes.string.isRequired,
};
