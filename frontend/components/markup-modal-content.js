import React from 'react'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import pathToRegexp from 'path-to-regexp'
import humanizeString from 'humanize-string'
import { badgeUrlFromPath, badgeUrlFromPattern } from '../../lib/make-badge-url'
import generateAllMarkup from '../lib/generate-image-markup'
import { advertisedStyles } from '../../supported-features.json'
import { Snippet2 } from './snippet'
import { BaseFont, H3, Badge, BlockInput, StyledInput } from './common'

const common = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: 'false',
}

const WeeSnippet = ({ snippet }) => (
  <Snippet2 truncate fontSize="10pt" snippet={snippet} />
)
WeeSnippet.propTypes = {
  snippet: PropTypes.string.isRequired,
}

const Column = styled.span`
  height: 58px;

  float: left;
  display: flex;
  flex-direction: column;

  margin: 5px 0;

  ${({ horizPadding }) =>
    horizPadding &&
    css`
      padding-left: ${horizPadding};
      padding-right: ${horizPadding};
    `};
`

const Literal = styled.div`
  margin-top: 20px;
  ${({ marginLeft }) =>
    marginLeft &&
    css`
      margin-left: ${marginLeft};
    `};
`

const PositionedLabel = styled.label`
  height: 20px;
  width: 100%;

  text-align: center;

  font-family: system-ui;
  font-size: 11px;
  text-transform: lowercase;
`

const PositionedInput = styled(StyledInput)`
  width: 100%;
  text-align: center;

  margin-bottom: 10px;
`

const PositionedCaption = styled.span`
  width: 100%;
  text-align: center;

  color: #999;

  font-family: system-ui;
  font-size: 11px;
  text-transform: lowercase;
`

const NamedParamFieldContainer = styled.div`
  display: inline-block;

  padding: 11px 14px 10px;

  border-radius: 4px;
  background: #eef;
`

class NamedParamFields extends React.Component {
  constructor(props) {
    super(props)

    const namedParams = {}
    props.tokens
      .filter(t => typeof t !== 'string')
      .map(t => t.name)
      .forEach(name => {
        namedParams[name] = ''
      })

    this.state = { namedParams }
  }

  handleTokenChange = event => {
    const { name, value } = event.target
    const { namedParams } = this.state
    this.setState({
      namedParams: {
        ...namedParams,
        [name]: value,
      },
    })
  }

  renderLiteral(literal, index) {
    return (
      <Column key={literal}>
        <Literal marginLeft={index === 0 ? '3px' : undefined}>
          {literal}
        </Literal>
      </Column>
    )
  }

  renderNamedParam(token, index) {
    const { delimiter, name } = token

    const { exampleParams } = this.props
    const exampleValue = exampleParams[name]

    const { namedParams } = this.state
    const value = namedParams[name]

    return (
      <>
        {this.renderLiteral(delimiter)}
        <Column key={token.name} horizPadding="8px">
          <PositionedLabel htmlFor={name}>
            {humanizeString(name)}
          </PositionedLabel>
          <PositionedInput
            type="text"
            name={name}
            value={value}
            onChange={this.handleTokenChange}
            {...common}
          />
          <PositionedCaption>
            {index === 0 ? `e.g. ${exampleValue}` : exampleValue}
          </PositionedCaption>
        </Column>
      </>
    )
  }

  render() {
    const { tokens } = this.props
    let namedParamIndex = 0
    return (
      <NamedParamFieldContainer>
        {tokens.map((token, tokenIndex) =>
          typeof token === 'string'
            ? this.renderLiteral(token, tokenIndex)
            : this.renderNamedParam(token, namedParamIndex++)
        )}
      </NamedParamFieldContainer>
    )
  }
}
NamedParamFields.propTypes = {
  tokens: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.shape({
        delimiter: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        optional: PropTypes.bool.isRequired,
        partial: PropTypes.bool.isRequired,
        pattern: PropTypes.string.isRequired,
        prefix: PropTypes.string.isRequired,
        repeat: PropTypes.bool.isRequired,
      }),
    ])
  ).isRequired,
  exampleParams: PropTypes.object.isRequired,
}

export default class MarkupModalContent extends React.Component {
  static propTypes = {
    // This is an item from the `examples` array within the
    // `serviceDefinition` schema.
    // https://github.com/badges/shields/blob/master/services/service-definitions.js
    example: PropTypes.object,
    baseUrl: PropTypes.string.isRequired,
  }

  state = {
    badgeUrl: '',
    badgeUrlForProps: '',
    exampleUrl: '',
    link: '',
    style: 'flat',
  }

  static urlsForProps(props) {
    const {
      example: { example },
      baseUrl,
    } = props

    let badgeUrl
    let exampleUrl
    // There are two alternatives for `example`. Refer to the schema in
    // `services/service-definitions.js`.
    if (example.pattern !== undefined) {
      const { pattern, namedParams, queryParams } = example
      badgeUrl = badgeUrlFromPath({
        path: pattern,
        queryParams,
      })
      exampleUrl = badgeUrlFromPattern({
        baseUrl,
        pattern,
        namedParams,
        queryParams,
      })
    } else {
      const { path, queryParams } = example
      badgeUrl = badgeUrlFromPath({
        path,
        queryParams,
      })
      exampleUrl = ''
    }

    return { badgeUrl, exampleUrl }
  }

  static getDerivedStateFromProps(props, state) {
    let urlsForProps, link
    if (props.example) {
      urlsForProps = MarkupModalContent.urlsForProps(props)
      link = props.example.example.link
    } else {
      urlsForProps = { badgeUrl: '', exampleUrl: '' }
      link = ''
    }

    if (urlsForProps.badgeUrl === state.badgeUrlForProps) {
      return null
    } else {
      return {
        ...urlsForProps,
        badgeUrlForProps: urlsForProps.badgeUrl,
        link,
      }
    }
  }

  generateBuiltBadgeUrl() {
    const { baseUrl } = this.props
    const { badgeUrl, style } = this.state

    return badgeUrlFromPath({
      baseUrl,
      path: badgeUrl,
      format: '', // `badgeUrl` already contains `.svg`.
      style: style === 'flat' ? undefined : style,
    })
  }

  renderLivePreview() {
    const { badgeUrl } = this.state
    const includesPlaceholders = badgeUrl.includes(':')
    let src
    if (badgeUrl && !includesPlaceholders) {
      src = this.generateBuiltBadgeUrl()
    } else {
      src = undefined
    }
    return <Badge display="block" src={src} />
  }

  renderMarkup() {
    const {
      example: {
        example: { title },
      },
    } = this.props
    const { link } = this.state

    const builtBadgeUrl = this.generateBuiltBadgeUrl()
    const { markdown, reStructuredText, asciiDoc } = generateAllMarkup(
      builtBadgeUrl,
      link,
      title
    )

    return (
      <div>
        <p>
          URL&nbsp;
          <WeeSnippet snippet={builtBadgeUrl} />
        </p>
        <p>
          Markdown&nbsp;
          <WeeSnippet snippet={markdown} />
        </p>
        <p>
          reStructuredText&nbsp;
          <WeeSnippet snippet={reStructuredText} />
        </p>
        <p>
          AsciiDoc&nbsp;
          <WeeSnippet snippet={asciiDoc} />
        </p>
      </div>
    )
  }

  renderDocumentation() {
    const {
      example: { documentation },
    } = this.props

    return documentation ? (
      <div>
        <h4>Documentation</h4>
        <div dangerouslySetInnerHTML={{ __html: documentation }} />
      </div>
    ) : null
  }

  renderFullPattern() {
    const {
      baseUrl,
      example: {
        example: { pattern },
      },
    } = this.props
    return (
      <Snippet2
        snippet={pattern}
        snippetToCopy={`${baseUrl}${pattern}.svg`}
        fontSize="9pt"
      />
    )
  }

  render() {
    const {
      baseUrl,
      example: {
        title,
        example: { pattern, namedParams },
      },
    } = this.props
    const { link, badgeUrl, exampleUrl, style } = this.state

    return (
      <form action="">
        <H3>{title}</H3>
        <NamedParamFields
          tokens={pathToRegexp.parse(pattern)}
          exampleParams={namedParams}
        />
        {this.renderLivePreview()}
        <p>
          <label>
            Style&nbsp;
            <select
              value={style}
              onChange={event => {
                this.setState({ style: event.target.value })
              }}
            >
              {advertisedStyles.map(style => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </label>
        </p>
        {this.renderMarkup()}
        {this.renderDocumentation()}
        {this.renderFullPattern()}
      </form>
    )
  }
}
