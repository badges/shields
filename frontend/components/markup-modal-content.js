import React from 'react'
import PropTypes from 'prop-types'
import { staticBadgeUrl } from '../lib/badge-url'
import { badgeUrlFromPath, badgeUrlFromPattern } from '../../lib/make-badge-url'
import generateAllMarkup from '../lib/generate-image-markup'
import { advertisedStyles } from '../../supported-features.json'
import { Snippet2 } from './snippet'
import { H3, Badge } from './common'
import PathBuilder from './path-builder'

const WeeSnippet = ({ snippet }) => (
  <Snippet2 truncate fontSize="10pt" snippet={snippet} />
)
WeeSnippet.propTypes = {
  snippet: PropTypes.string.isRequired,
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
      style: style === 'flat' ? undefined : style,
    })
  }

  renderLivePreview() {
    const { baseUrl } = this.props
    const { isComplete } = this.state
    let src
    if (isComplete) {
      src = this.generateBuiltBadgeUrl()
    } else {
      src = staticBadgeUrl(
        baseUrl,
        'preview',
        'some parameters missing',
        'lightgray'
      )
    }
    return (
      <p>
        Live preview&nbsp;
        <Badge display="block" src={src} />
      </p>
    )
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

  handlePathChange = ({ path, isComplete }) => {
    this.setState({ badgeUrl: path, isComplete })
  }

  render() {
    const {
      example: {
        title,
        example: { pattern, namedParams },
      },
    } = this.props
    const { style } = this.state

    return (
      <form action="">
        <H3>{title}</H3>
        <PathBuilder
          pattern={pattern}
          exampleParams={namedParams}
          onChange={this.handlePathChange}
        />
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
        {this.renderLivePreview()}
        {this.renderMarkup()}
        {this.renderDocumentation()}
        {this.renderFullPattern()}
      </form>
    )
  }
}
