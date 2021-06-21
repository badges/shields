import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'
import { staticBadgeUrl } from '../../core/badge-urls/make-badge-url'
import { advertisedStyles, shieldsLogos } from '../lib/supported-features'
// ts-expect-error: because reasons?
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

function QueryParam({
  snippet,
  documentation,
}: {
  snippet: string
  documentation: JSX.Element | JSX.Element[]
}): JSX.Element {
  return (
    <tr>
      <QueryParamSyntax>
        <Snippet snippet={snippet} />
      </QueryParamSyntax>
      <QueryParamDocumentation>{documentation}</QueryParamDocumentation>
    </tr>
  )
}

function EscapingConversion({
  lhs,
  rhs,
}: {
  lhs: JSX.Element
  rhs: JSX.Element
}): JSX.Element {
  return (
    <tr>
      <Lhs>{lhs}</Lhs>
      <td>→</td>
      <td>{rhs}</td>
    </tr>
  )
}

function ColorExamples({
  baseUrl,
  colors,
}: {
  baseUrl: string
  colors: string[]
}): JSX.Element {
  return (
    <span>
      {colors.map((color, i) => (
        <Badge
          alt={color}
          key={color}
          src={staticBadgeUrl({ baseUrl, label: '', message: color, color })}
        />
      ))}
    </span>
  )
}

function StyleExamples({ baseUrl }: { baseUrl: string }): JSX.Element {
  return (
    <QueryParamTable>
      <tbody>
        {advertisedStyles.map(style => {
          const snippet = `?style=${style}&logo=appveyor`
          const badgeUrl = staticBadgeUrl({
            baseUrl,
            label: 'style',
            message: style,
            color: 'green',
            namedLogo: 'appveyor',
            style,
          })
          return (
            <QueryParam
              documentation={<Badge alt={style} src={badgeUrl} />}
              key={style}
              snippet={snippet}
            />
          )
        })}
      </tbody>
    </QueryParamTable>
  )
}

function NamedLogos(): JSX.Element {
  const renderLogo = (logo: string): JSX.Element => (
    <LogoName key={logo}>{logo}</LogoName>
  )
  const [first, ...rest] = shieldsLogos
  const result = ([renderLogo(first)] as (JSX.Element | string)[]).concat(
    rest.reduce(
      (result, logo) => result.concat([', ', renderLogo(logo)]),
      [] as (JSX.Element | string)[]
    )
  )
  return <>{result}</>
}

function StaticBadgeEscapingRules(): JSX.Element {
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

export default function Usage({ baseUrl }: { baseUrl: string }): JSX.Element {
  return (
    <section>
      <H2 id="your-badge">Your Badge</H2>

      <H3>Static</H3>
      <StaticBadgeMaker baseUrl={baseUrl} />

      <VerticalSpace />

      <p>Using dash "-" separator</p>
      <p>
        <Snippet snippet={`${baseUrl}/badge/<LABEL>-<MESSAGE>-<COLOR>`} />
      </p>
      <StaticBadgeEscapingRules />
      <p>Using query string parameters</p>
      <p>
        <Snippet
          snippet={`${baseUrl}/static/v1?label=<LABEL>&message=<MESSAGE>&color=<COLOR>`}
        />
      </p>

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

      <H3>Endpoint</H3>

      <p>
        <Snippet snippet={`${baseUrl}/endpoint?url=<URL>&style<STYLE>`} />
      </p>

      <p>
        Create badges from <Link to="/endpoint">your own JSON endpoint</Link>.
      </p>

      <H3 id="dynamic-badge">Dynamic</H3>

      <DynamicBadgeMaker baseUrl={baseUrl} />

      <p>
        <StyledCode>
          {baseUrl}
          /badge/dynamic/json?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
          <a
            href="https://jsonpath.com"
            rel="noopener noreferrer"
            target="_blank"
            title="JSONPath syntax"
          >
            $.DATA.SUBDATA
          </a>
          &gt;&amp;color=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
        </StyledCode>
      </p>
      <p>
        <StyledCode>
          {baseUrl}
          /badge/dynamic/xml?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
          <a
            href="http://xpather.com"
            rel="noopener noreferrer"
            target="_blank"
            title="XPath syntax"
          >
            &#x2F;&#x2F;data/subdata
          </a>
          &gt;&amp;color=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
        </StyledCode>
      </p>
      <p>
        <StyledCode>
          {baseUrl}
          /badge/dynamic/yaml?url=&lt;URL&gt;&amp;label=&lt;LABEL&gt;&amp;query=&lt;
          <a
            href="https://jsonpath.com"
            rel="noopener noreferrer"
            target="_blank"
            title="YAML (JSONPath) syntax"
          >
            $.DATA.SUBDATA
          </a>
          &gt;&amp;color=&lt;COLOR&gt;&amp;prefix=&lt;PREFIX&gt;&amp;suffix=&lt;SUFFIX&gt;
        </StyledCode>
      </p>

      <VerticalSpace />

      <H2 id="styles">Styles</H2>

      <p>
        The following styles are available. Flat is the default. Examples are
        shown with an optional logo:
      </p>
      <StyleExamples baseUrl={baseUrl} />

      <p>
        Here are a few other parameters you can use: (connecting several with
        "&" is possible)
      </p>
      <QueryParamTable>
        <tbody>
          <QueryParam
            documentation={
              <span>
                Override the default left-hand-side text (
                <a href="https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding">
                  URL-Encoding
                </a>
                {} needed for spaces or special characters!)
              </span>
            }
            key="label"
            snippet="?label=healthinesses"
          />
          <QueryParam
            documentation={
              <span>
                Insert one of the named logos from (<NamedLogos />) or{' '}
                <a
                  href="https://simpleicons.org/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  simple-icons
                </a>
                . Simple-icons are referenced using icon slugs which can be
                found on the simple-icons site or in the{' '}
                <a href="https://github.com/simple-icons/simple-icons/blob/develop/slugs.md">
                  slugs.md file
                </a>{' '}
                in the simple-icons repository.
              </span>
            }
            key="logo"
            snippet="?logo=appveyor"
          />
          <QueryParam
            documentation={
              <span>
                Insert custom logo image (≥ 14px high). There is a limit on the
                total size of request headers we can accept (8192 bytes). From a
                practical perspective, this means the base64-encoded image text
                is limited to somewhere slightly under 8192 bytes depending on
                the rest of the request header.
              </span>
            }
            key="logoSvg"
            snippet="?logo=data:image/png;base64,…"
          />
          <QueryParam
            documentation={
              <span>
                Set the color of the logo (hex, rgb, rgba, hsl, hsla and css
                named colors supported). Supported for named logos but not for
                custom logos.
              </span>
            }
            key="logoColor"
            snippet="?logoColor=violet"
          />
          <QueryParam
            documentation={
              <span>Set the horizontal space to give to the logo</span>
            }
            key="logoWidth"
            snippet="?logoWidth=40"
          />
          <QueryParam
            documentation={
              <span>
                Specify what clicking on the left/right of a badge should do.
                Note that this only works when integrating your badge in an
                <StyledCode>&lt;object&gt;</StyledCode> HTML tag, but not an
                <StyledCode>&lt;img&gt;</StyledCode> tag or a markup language.
              </span>
            }
            key="link"
            snippet="?link=http://left&amp;link=http://right"
          />
          <QueryParam
            documentation={
              <span>
                Set background of the left part (hex, rgb, rgba, hsl, hsla and
                css named colors supported). The legacy name "colorA" is also
                supported.
              </span>
            }
            key="labelColor"
            snippet="?labelColor=abcdef"
          />
          <QueryParam
            documentation={
              <span>
                Set background of the right part (hex, rgb, rgba, hsl, hsla and
                css named colors supported). The legacy name "colorB" is also
                supported.
              </span>
            }
            key="color"
            snippet="?color=fedcba"
          />
          <QueryParam
            documentation={
              <span>
                Set the HTTP cache lifetime (rules are applied to infer a
                default value on a per-badge basis, any values specified below
                the default will be ignored). The legacy name "maxAge" is also
                supported.
              </span>
            }
            key="cacheSeconds"
            snippet="?cacheSeconds=3600"
          />
        </tbody>
      </QueryParamTable>

      <p>
        We support <code>.svg</code> and <code>.json</code>. The default is{' '}
        <code>.svg</code>, which can be omitted from the URL.
      </p>

      <p>
        While we highly recommend using SVG, we also support <code>.png</code>{' '}
        for use cases where SVG will not work. These requests should be made to
        our raster server <code>https://raster.shields.io</code>. For example,
        the raster equivalent of{' '}
        <code>https://img.shields.io/npm/v/express</code> is{' '}
        <code>https://raster.shields.io/npm/v/express</code>. For backward
        compatibility, the badge server will redirect <code>.png</code> badges
        to the raster server.
      </p>
    </section>
  )
}
