import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { staticBadgeUrl } from '../lib/badge-url'
import { baseUrl } from '../constants'
import Meta from './meta'
import Header from './header'
import Footer from './footer'
import { H3, Badge } from './common'
import { Snippet } from './snippet'

const Explanation = styled.div`
  max-width: 800px;
  display: block;
`

const JsonExampleBlock = styled.code`
  display: inline-block;

  text-align: left;
  line-height: 1.2em;
  padding: 16px 18px;

  border-radius: 4px;
  background: #eef;

  font-family: Lekton;
  font-size: ${({ fontSize }) => fontSize};

  white-space: pre;
`

const JsonExample = ({ data }) => (
  <JsonExampleBlock>{JSON.stringify(data, undefined, 2)}</JsonExampleBlock>
)
JsonExample.propTypes = {
  data: PropTypes.string.isRequired,
}

const Schema = styled.dl`
  display: inline-block;
  max-width: 800px;

  margin: 0;
  padding: 10px;
  text-align: left;

  background: #efefef;

  clear: both;
  overflow: hidden;

  dt,
  dd {
    padding: 0 1%;
    margin-top: 8px;
    margin-bottom: 8px;
    float: left;
  }

  dt {
    width: 100px;
    clear: both;
  }

  dd {
    margin-left: 20px;
    width: 75%;
  }

  @media (max-width: 600px) {
    .data_table {
      text-align: center;
    }
  }
`

const EndpointPage = () => (
  <div>
    <Meta />
    <Header />
    <H3 id="static-badge">Endpoint</H3>
    <Snippet snippet={`${baseUrl}/badge/endpoint.svg?url=...&style=...`} />
    <p>Sample response:</p>
    <JsonExample
      data={{
        schemaVersion: 1,
        label: 'hello',
        message: 'sweet world',
        color: 'orange',
      }}
    />
    <p>Output:</p>
    <Badge
      src={staticBadgeUrl(baseUrl, 'hello', 'sweet world', 'orange')}
      alt="hello | sweet world"
    />
    <Explanation>
      <p>
        Developers rely on Shields for visual consistency and powerful
        customization options. The endpoint badge gives service providers the
        full power of that customization using badge content they provide.
      </p>
      <p>
        Using the endpoint badge, you can provide content for a badge through a
        JSON endpoint. The URL of the endpoint is embedded into the badge URL,
        and the content is fetched and formatted by Shields. The content can be
        prerendered, or generated on the fly. To strike a balance between
        responsiveness and bandwith utilization on one hand, and freshness on
        the other, cache behavior is configurable, subject to the Shields
        minimum.
      </p>
      <p>
        The endpoint badge is a better alternative than redirecting to the
        static badge enpoint or using our NPM package on your server:
      </p>
      <ol>
        <li>
          <a href="https://en.wikipedia.org/wiki/Separation_of_content_and_presentation">
            Content and presentation are separate.
          </a>{' '}
          The service provider authors the badge, and Shields takes input from
          the user to format it. The service provider doesn't have to concern
          itself with styling, not even to pass those options through to
          Shields.
        </li>
        <li>
          There's no need to track updates to the npm package, badge templates,
          or options. Badge formatting is always 100% up to date.
        </li>
        <li>
          Compared with an HTTP redirect, a JSON response is easier to
          implement. It is trivial in almost any framework, and is more
          compatible with hosting environments such as{' '}
          <a href="https://runkit.com/docs/endpoint">RunKit endpoints</a>.
        </li>
        <li>
          Service providers can rely on the Shields CDN. Adjusting cache
          behavior is as simple as setting a property in the JSON response.
          There's no need to study the HTTP headers.
        </li>
      </ol>
    </Explanation>
    <h4>Schema</h4>
    <Schema>
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
        badge. This prevents the user from overriding the color. In the future
        it may affect cache behavior.
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
        the user via the query string, but only to a longer value.
      </dd>
    </Schema>
    <Footer baseUrl={baseUrl} />
  </div>
)
export default EndpointPage
