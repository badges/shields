import React from 'react'
import { Link } from 'gatsby'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { staticBadgeUrl } from '../lib/badge-url'
import { advertisedStyles, shieldsLogos } from '../../supported-features.json'
import StaticBadgeMaker from './static-badge-maker'
import DynamicBadgeMaker from './dynamic-badge-maker'
import { H2, H3, Badge, VerticalSpace } from './common'
import { Snippet, StyledCode } from './snippet'

const LogoName = styled.span`
  white-space: nowrap;
`

const Lhs = styled.td`
  text-align: right;
`

const EscapingRuleTable = styled.table`
  margin: auto;
`

const QueryParamTable = styled.table`
  min-width: 50%;
  margin: auto;
  table-layout: fixed;
  border-spacing: 20px 10px;
`

const QueryParamSyntax = styled.td`
  max-width: 300px;
  text-align: left;
`

const QueryParamDocumentation = styled.td`
  max-width: 600px;
  text-align: left;
`

const QueryParam = ({ snippet, documentation }) => (
  <tr>
    <QueryParamSyntax>
      <Snippet snippet={snippet} />
    </QueryParamSyntax>
    <QueryParamDocumentation>{documentation}</QueryParamDocumentation>
  </tr>
)
QueryParam.propTypes = {
  snippet: PropTypes.string.isRequired,
  documentation: PropTypes.element.isRequired,
}

const EscapingConversion = ({ lhs, rhs }) => (
  <tr>
    <Lhs>{lhs}</Lhs>
    <td>→</td>
    <td>{rhs}</td>
  </tr>
)
EscapingConversion.propTypes = {
  lhs: PropTypes.element.isRequired,
  rhs: PropTypes.element.isRequired,
}

const ColorExamples = ({ baseUrl, colors }) => (
  <span>
    {colors.map((color, i) => (
      <Badge
        key={color}
        src={staticBadgeUrl(baseUrl, '', color, color)}
        alt={color}
      />
    ))}
  </span>
)
ColorExamples.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  colors: PropTypes.array.isRequired,
}

export default class Usage extends React.PureComponent {
  static propTypes = {
    baseUrl: PropTypes.string.isRequired,
  }

  renderStyleExamples() {
    const { baseUrl } = this.props
    return (
      <QueryParamTable>
        <tbody>
          {advertisedStyles.map(style => {
            const snippet = `?style=${style}&logo=appveyor`
            const badgeUrl = staticBadgeUrl(baseUrl, 'style', style, 'green', {
              logo: 'appveyor',
              style,
            })
            return (
              <QueryParam
                key={style}
                snippet={snippet}
                documentation={<Badge src={badgeUrl} alt={style} />}
              />
            )
          })}
        </tbody>
      </QueryParamTable>
    )
  }

  static renderNamedLogos() {
    const renderLogo = logo => <LogoName key={logo}>{logo}</LogoName>
    const [first, ...rest] = shieldsLogos
    return [renderLogo(first)].concat(
      rest.reduce((result, logo) => result.concat([', ', renderLogo(logo)]), [])
    )
  }

  static renderStaticBadgeEscapingRules() {
    return (
      <EscapingRuleTable>
        <tbody>
          <EscapingConversion
            key="dashes"
            lhs={
              <span>
                Dashes <code>--</code>
              </span>
            }
            rhs={
              <span>
                <code>-</code> Dash
              </span>
            }
          />
          <EscapingConversion
            key="underscores"
            lhs={
              <span>
                Underscores <code>__</code>
              </span>
            }
            rhs={
              <span>
                <code>_</code> Underscore
              </span>
            }
          />
          <EscapingConversion
            key="spaces"
            lhs={
              <span>
                <code>_</code> or Space <code>&nbsp;</code>
              </span>
            }
            rhs={
              <span>
                <code>&nbsp;</code> Space
              </span>
            }
          />
        </tbody>
      </EscapingRuleTable>
    )
  }

  render() {
    const { baseUrl } = this.props
    return (
      <section>
        <H2 id="your-badge">Your Badge</H2>

        <H3 id="static-badge">Static</H3>
        <StaticBadgeMaker baseUrl={baseUrl} />

        <VerticalSpace />

        <p>
          <Snippet
            snippet={`${baseUrl}/badge/<SUBJECT>-<STATUS>-<COLOR>.svg`}
          />
        </p>
        {this.constructor.renderStaticBadgeEscapingRules()}

        <H3 id="colors">Colors</H3>
        <p>
          <ColorExamples
            baseUrl={baseUrl}
            colors={[
              'brightgreen',
              'green',
              'yellowgreen',
              'yellow',
              'orange',
              'red',
              'blue',
              'lightgrey',
            ]}
          />
          <br />
          <ColorExamples
            baseUrl={baseUrl}
            colors={[
              'success',
              'important',
              'critical',
              'informational',
              'inactive',
            ]}
          />
          <br />
          <ColorExamples
            baseUrl={baseUrl}
            colors={['blueviolet', 'ff69b4', '9cf']}
          />
        </p>

        <H3 id="endpoint">Endpoint (Beta)</H3>

        <p>
          <Snippet
            snippet={`${baseUrl}/badge/endpoint.svg?url=<URL>&style<STYLE>`}
          />
        </p>

        <p>
          Create badges from{' '}
          <Link to={'/endpoint'}>your own JSON endpoint</Link>.
        </p>

        <H3 id="dynamic-badge">Dynamic</H3>

        <DynamicBadgeMaker baseUrl={baseUrl} />

        <p>
          <StyledCode>
            {baseUrl}
            /badge/dynamic/json.svg?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
            <a
              href="https://www.npmjs.com/package/jsonpath"
              target="_BLANK"
              title="JSONdata syntax"
            >
              $.DATA.SUBDATA
            </a>
            &gt;&amp;colorB=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
          </StyledCode>
        </p>
        <p>
          <StyledCode>
            {baseUrl}
            /badge/dynamic/xml.svg?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
            <a
              href="https://www.npmjs.com/package/xpath"
              target="_BLANK"
              title="XPath syntax"
            >
              //data/subdata
            </a>
            &gt;&amp;colorB=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
          </StyledCode>
        </p>
        <p>
          <StyledCode>
            {baseUrl}
            /badge/dynamic/yaml.svg?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
            <a
              href="https://www.npmjs.com/package/jsonpath"
              target="_BLANK"
              title="JSONdata syntax"
            >
              $.DATA.SUBDATA
            </a>
            &gt;&amp;colorB=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
          </StyledCode>
        </p>

        <VerticalSpace />

        <H2 id="styles">Styles</H2>

        <p>
          The following styles are available. Flat is the default. Examples are
          shown with an optional logo:
        </p>
        {this.renderStyleExamples()}

        <p>
          Here are a few other parameters you can use: (connecting several with
          "&" is possible)
        </p>
        <QueryParamTable>
          <tbody>
            <QueryParam
              key="label"
              snippet="?label=healthinesses"
              documentation={
                <span>
                  Override the default left-hand-side text (
                  <a href="https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding">
                    URL-Encoding
                  </a>
                  {} needed for spaces or special characters!)
                </span>
              }
            />
            <QueryParam
              key="logo"
              snippet="?logo=appveyor"
              documentation={
                <span>
                  Insert one of the named logos from (
                  {this.constructor.renderNamedLogos()}) or{' '}
                  <a href="https://simpleicons.org/" target="_BLANK">
                    simple-icons
                  </a>
                </span>
              }
            />
            <QueryParam
              key="logoSvg"
              snippet="?logo=data:image/png;base64,…"
              documentation={
                <span>Insert custom logo image (≥ 14px high)</span>
              }
            />
            <QueryParam
              key="logoColor"
              snippet="?logoColor=violet"
              documentation={
                <span>
                  Set the color of the logo (hex, rgb, rgba, hsl, hsla and css
                  named colors supported)
                </span>
              }
            />
            <QueryParam
              key="logoWidth"
              snippet="?logoWidth=40"
              documentation={
                <span>Set the horizontal space to give to the logo</span>
              }
            />
            <QueryParam
              key="link"
              snippet="?link=http://left&amp;link=http://right"
              documentation={
                <span>
                  Specify what clicking on the left/right of a badge should do
                  (esp. for social badge style)
                </span>
              }
            />
            <QueryParam
              key="colorA"
              snippet="?colorA=abcdef"
              documentation={
                <span>
                  Set background of the left part (hex, rgb, rgba, hsl, hsla and
                  css named colors supported)
                </span>
              }
            />
            <QueryParam
              key="colorB"
              snippet="?colorB=fedcba"
              documentation={
                <span>
                  Set background of the right part (hex, rgb, rgba, hsl, hsla
                  and css named colors supported)
                </span>
              }
            />
            <QueryParam
              key="maxAge"
              snippet="?maxAge=3600"
              documentation={
                <span>
                  Set the HTTP cache lifetime in secs (rules are applied to
                  infer a default value on a per-badge basis, any values
                  specified below the default will be ignored)
                </span>
              }
            />
          </tbody>
        </QueryParamTable>

        <p>
          We support <code>.svg</code>, <code>.json</code>, <code>.png</code>{' '}
          and a few others, but use them responsibly.
        </p>
      </section>
    )
  }
}
