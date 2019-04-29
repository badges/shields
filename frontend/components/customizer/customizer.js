import React from 'react'
import PropTypes from 'prop-types'
import clipboardCopy from 'clipboard-copy'
import { staticBadgeUrl } from '../../../core/badge-urls/make-badge-url'
import { generateMarkup } from '../../lib/generate-image-markup'
import { objectOfKeyValuesPropType } from '../../lib/service-definitions/service-definition-prop-types'
import { Badge } from '../common'
import PathBuilder from './path-builder'
import QueryStringBuilder from './query-string-builder'
import RequestMarkupButtom from './request-markup-button'
import CopiedContentIndicator from './copied-content-indicator'

export default class Customizer extends React.Component {
  static propTypes = {
    baseUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    pattern: PropTypes.string.isRequired,
    exampleNamedParams: objectOfKeyValuesPropType,
    exampleQueryParams: objectOfKeyValuesPropType,
    initialStyle: PropTypes.string,
    isPrefilled: PropTypes.bool,
    link: PropTypes.string,
  }

  indicatorRef = React.createRef()

  get baseUrl() {
    const { baseUrl } = this.props
    if (baseUrl) {
      return baseUrl
    } else {
      // Default to the current hostname for when there is no `BASE_URL` set
      // at build time (as in most PaaS deploys).
      const { protocol, hostname } = window.location
      return `${protocol}//${hostname}`
    }
  }

  generateBuiltBadgeUrl() {
    const { baseUrl } = this
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
      src = staticBadgeUrl({
        baseUrl,
        label: 'preview',
        message: 'some parameters missing',
      })
    }
    return (
      <p>
        <Badge display="block" src={src} />
      </p>
    )
  }

  copyMarkup = async markupFormat => {
    const { title } = this.props
    const { link } = this.state

    const builtBadgeUrl = this.generateBuiltBadgeUrl()
    const markup = generateMarkup({
      badgeUrl: builtBadgeUrl,
      link,
      title,
      markupFormat,
    })

    try {
      await clipboardCopy(markup)
    } catch (e) {
      this.setState({
        message: 'Copy failed',
        markup,
      })
      return
    }

    this.setState({ markup })
    this.indicatorRef.current.trigger()
  }

  renderMarkupAndLivePreview() {
    const { indicatorRef } = this
    const { markup, message, pathIsComplete } = this.state

    return (
      <div>
        {this.renderLivePreview()}
        <CopiedContentIndicator copiedContent="Copied" ref={indicatorRef}>
          <RequestMarkupButtom
            isDisabled={!pathIsComplete}
            onMarkupRequested={this.copyMarkup}
          />
        </CopiedContentIndicator>
        {message && (
          <div>
            <p>{message}</p>
            <p>Markup: {markup}</p>
          </div>
        )}
      </div>
    )
  }

  handlePathChange = ({ path, isComplete }) => {
    this.setState({ path, pathIsComplete: isComplete })
  }

  handleQueryStringChange = ({ queryString, isComplete }) => {
    this.setState({ queryString })
  }

  constructor(props) {
    super(props)
    this.state = {
      link: this.props.link || '',
      message: undefined,
      path: '',
    }
  }

  render() {
    const {
      pattern,
      exampleNamedParams,
      exampleQueryParams,
      initialStyle,
      isPrefilled,
    } = this.props

    return (
      <form action="">
        <PathBuilder
          exampleParams={exampleNamedParams}
          isPrefilled={isPrefilled}
          onChange={this.handlePathChange}
          pattern={pattern}
        />
        <QueryStringBuilder
          exampleParams={exampleQueryParams}
          initialStyle={initialStyle}
          onChange={this.handleQueryStringChange}
        />
        <div>{this.renderMarkupAndLivePreview()}</div>
      </form>
    )
  }
}
