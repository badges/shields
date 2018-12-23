import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { staticBadgeUrl } from '../../lib/badge-url'
import generateAllMarkup from '../../lib/generate-image-markup'
import { Snippet2 } from '../snippet'
import { H3, Badge } from '../common'
import PathBuilder from './path-builder'
import QueryStringBuilder from './query-string-builder'

const WeeSnippet = ({ snippet }) => (
  <Snippet2 truncate fontSize="10pt" snippet={snippet} />
)
WeeSnippet.propTypes = {
  snippet: PropTypes.string.isRequired,
}

const Documentation = styled.div`
  max-width: 800px;
  margin: 35px auto 20px;
`

export default class MarkupModalContent extends React.Component {
  static propTypes = {
    // This is an item from the `examples` array within the
    // `serviceDefinition` schema.
    // https://github.com/badges/shields/blob/master/services/service-definitions.js
    example: PropTypes.object,
    baseUrl: PropTypes.string.isRequired,
  }

  state = {
    path: '',
    link: '',
  }

  generateBuiltBadgeUrl() {
    const { baseUrl } = this.props
    const { path, queryString } = this.state

    const suffix = queryString ? `?${queryString}` : ''
    return `${baseUrl}${path}.svg${suffix}`
  }

  renderLivePreview() {
    // There are some usability issues here. It would be better if the message
    // changed from a validation error to a loading message once the
    // parameters were filled in, and also switched back to loading when the
    // parameters changed.
    const { baseUrl } = this.props
    const { pathIsComplete } = this.state
    let src
    if (pathIsComplete) {
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
      <Documentation dangerouslySetInnerHTML={{ __html: documentation }} />
    ) : null
  }

  // renderFullPattern() {
  //   const {
  //     baseUrl,
  //     example: {
  //       example: { pattern },
  //     },
  //   } = this.props
  //   return (
  //     <Snippet2
  //       snippet={pattern}
  //       snippetToCopy={`${baseUrl}${pattern}.svg`}
  //       fontSize="9pt"
  //     />
  //   )
  // }

  handlePathChange = ({ path, isComplete }) => {
    this.setState({ path, pathIsComplete: isComplete })
  }

  handleQueryStringChange = ({ queryString, isComplete }) => {
    this.setState({ queryString, queryStringIsComplete: isComplete })
  }

  render() {
    const {
      example: {
        title,
        example: { pattern, namedParams, queryParams },
      },
    } = this.props
    return (
      <form action="">
        <H3>{title}</H3>
        {this.renderDocumentation()}
        <PathBuilder
          pattern={pattern}
          exampleParams={namedParams}
          onChange={this.handlePathChange}
        />
        <QueryStringBuilder
          exampleParams={queryParams}
          onChange={this.handleQueryStringChange}
        />
        {this.renderLivePreview()}
        {this.renderMarkup()}
      </form>
    )
  }
}
