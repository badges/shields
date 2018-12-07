import React from 'react'
import { Link } from 'react-router-dom'
import Meta from './meta'
import Header from './header'
import Footer from './footer'
import { baseUrl } from '../constants'

const example = JSON.stringify(
  {
    schemaVersion: 1,
    label: 'hello',
    message: 'sweet world',
    color: 'orange',
  },
  undefined,
  2
)

const EndpointPage = ({ baseUrl }) => (
  <div>
    <Meta />
    <Header />

    <h3 id="static-badge">Endpoint</h3>

    <p>
      <code>
        {baseUrl}
        /badge/endpoint.svg?url=&lt;URL&gt;&amp;style=&lt;STYLE&gt;
      </code>
    </p>

    <p style={{ textAlign: 'left' }}>
      Using the endpoint badge, you can create badges from your own JSON
      endpoint.
    </p>

    <p>The endpoint must return an object like this:</p>

    <code
      style={{
        display: 'block',
        width: '250px',
        margin: '0 auto',
        padding: '10px 30px',
        textAlign: 'left',
      }}
    >
      {example}
    </code>

    <h4>Schema</h4>

    <style jsx>{`
      .schema {
        display: inline-block;
        overflow: hidden;
        text-align: left;
        background: #efefef;
        padding: 10px;
        max-width: 800px;
      }
      .schema dt,
      .schema dd {
        padding: 0 1%;
        margin-top: 8px;
        margin-bottom: 8px;
        float: left;
      }
      .schema dt {
        width: 100px;
        clear: both;
      }
      .schema dd {
        margin-left: 20px;
        width: 75%;
      }
      @media (max-width: 600px) {
        .data_table {
          text-align: center;
        }
      }
    `}</style>

    <dl className="schema">
      <dt>schemaVersion</dt>
      <dd>
        Required. Always the number <code>1</code>.
      </dd>
      <dt>label</dt>
      <dd>
        Required. The left text, or the empty string to omit the left side of
        the badge. This can be overridden by the query string.
      </dd>
      <dt>message</dt>
      <dd>Required. Can't be empty. The right text.</dd>
      <dt>color</dt>
      <dd>
        Default: <code>lightgrey</code>. The right color. Supports the eight
        named colors above, as well as hex, rgb, rgba, hsl, hsla and css named
        colors.
      </dd>
      <dt>labelColor</dt>
      <dd>
        Default: <code>grey</code>. The left color.
      </dd>
      <dt>isError</dt>
      <dd>
        Default: <code>false</code>. <code>true</code> to treat this as an error
        badge. In the future this will inhibit the query string from overriding
        the color and may affect cache behavior.
      </dd>
      <dt>link</dt>
      <dd>
        Default: none. Specify what clicking on the left/right of a badge should
        do.
      </dd>
      <dt>namedLogo</dt>
      <dd>
        Default: none. One of the named logos supported by Shields or {}
        <a href="https://simpleicons.org/">simple-icons</a>. Can be overridden
        by the query string.
      </dd>
      <dt>logoSvg</dt>
      <dd>Default: none. An SVG string containing a custom logo.</dd>
      <dt>logoColor</dt>
      <dd>
        Default: none. Same meaning as the query string. Can be overridden by
        the query string.
      </dd>
      <dt>logoWidth</dt>
      <dd>
        Default: none. Same meaning as the query string. Can be overridden by
        the query string.
      </dd>
      <dt>logoPosition</dt>
      <dd>
        Default: none. Same meaning as the query string. Can be overridden by
        the query string.
      </dd>
      <dt>style</dt>
      <dd>
        Default: <code>flat</code>. The default template to use. Can be
        overridden by the query string.
      </dd>
      <dt>cacheSeconds</dt>
      <dd>
        Default: <code>300</code>. Set the HTTP cache lifetime in seconds, which
        should respected by the Shields' CDN and downstream users. This lets you
        tune performance and traffic vs. responsiveness. Can be overridden by
        the query string, but only to a larger value.
      </dd>
    </dl>
    <br style={{ clear: 'both' }} />
    <Footer />
  </div>
)
export default EndpointPage
