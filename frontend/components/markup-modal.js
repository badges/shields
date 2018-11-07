import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import ClickToSelect from '@mapbox/react-click-to-select'
import resolveBadgeUrl from '../lib/badge-url'
import generateAllMarkup from '../lib/generate-image-markup'
import { advertisedStyles } from '../../supported-features.json'

export default class MarkupModal extends React.Component {
  static propTypes = {
    example: PropTypes.shape({
      title: PropTypes.string.isRequired,
      exampleUrl: PropTypes.string,
      previewUrl: PropTypes.string,
      urlPattern: PropTypes.string,
      documentation: PropTypes.string,
      link: PropTypes.string,
    }),
    baseUrl: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  }

  state = {
    exampleUrl: null,
    badgeUrl: null,
    link: '',
    style: 'flat',
  }

  constructor(props) {
    super(props)

    // Transfer `badgeUrl` and `link` into state so they can be edited by the
    // user.
    const { example, baseUrl } = props
    if (example) {
      const { exampleUrl, urlPattern, previewUrl, link } = example
      this.state = {
        ...this.state,
        exampleUrl: exampleUrl
          ? resolveBadgeUrl(exampleUrl, baseUrl || window.location.href)
          : null,
        badgeUrl: resolveBadgeUrl(
          urlPattern || previewUrl,
          baseUrl || window.location.href
        ),
        link: !link ? '' : link,
      }
    }
  }

  get isOpen() {
    return this.props.example !== null
  }

  generateCompleteBadgeUrl() {
    const { baseUrl } = this.props
    const { badgeUrl, style } = this.state

    return resolveBadgeUrl(
      badgeUrl,
      baseUrl || window.location.href,
      // Default style doesn't need to be specified.
      style === 'flat' ? undefined : { style }
    )
  }

  generateMarkup() {
    if (!this.isOpen) {
      return {}
    }

    const { title } = this.props.example
    const { link } = this.state
    const completeBadgeUrl = this.generateCompleteBadgeUrl()
    return generateAllMarkup(completeBadgeUrl, link, title)
  }

  renderDocumentation() {
    if (!this.isOpen) {
      return null
    }

    const { documentation } = this.props.example
    return documentation ? (
      <div>
        <h4>Documentation</h4>
        <div dangerouslySetInnerHTML={{ __html: documentation }} />
      </div>
    ) : null
  }

  render() {
    const { markdown, reStructuredText, asciiDoc } = this.generateMarkup()

    const completeBadgeUrl = this.isOpen
      ? this.generateCompleteBadgeUrl()
      : undefined

    return (
      <Modal
        isOpen={this.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel="Example Modal"
      >
        <form action="">
          <p>
            <img className="badge-img" src={completeBadgeUrl} />
          </p>
          <p>
            <label>
              Link&nbsp;
              <input
                type="url"
                value={this.state.link}
                onChange={event => {
                  this.setState({ link: event.target.value })
                }}
              />
            </label>
          </p>
          <p>
            <label>
              Image&nbsp;
              <input
                type="url"
                value={this.state.badgeUrl}
                onChange={event => {
                  this.setState({ badgeUrl: event.target.value })
                }}
              />
            </label>
          </p>
          {this.state.exampleUrl && (
            <p>
              Example&nbsp;
              <ClickToSelect>
                <input
                  className="code clickable"
                  readOnly
                  value={this.state.exampleUrl}
                />
              </ClickToSelect>
            </p>
          )}
          <p>
            <label>
              Style&nbsp;
              <select
                value={this.state.style}
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
          <p>
            Markdown&nbsp;
            <ClickToSelect>
              <input className="code clickable" readOnly value={markdown} />
            </ClickToSelect>
          </p>
          <p>
            reStructuredText&nbsp;
            <ClickToSelect>
              <input
                className="code clickable"
                readOnly
                value={reStructuredText}
              />
            </ClickToSelect>
          </p>
          <p>
            AsciiDoc&nbsp;
            <ClickToSelect>
              <input className="code clickable" readOnly value={asciiDoc} />
            </ClickToSelect>
          </p>
          {this.renderDocumentation()}
        </form>
      </Modal>
    )
  }
}
