import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import ClickToSelect from '@mapbox/react-click-to-select';
import resolveBadgeUrl from '../lib/badge-url';
import generateAllMarkup from '../lib/generate-image-markup';
import { advertisedStyles } from '../../lib/supported-features';

export default class MarkupModal extends React.Component {
  static propTypes = {
    example: PropTypes.shape({
      title: PropTypes.string.isRequired,
      previewUri: PropTypes.string,
      exampleUri: PropTypes.string,
      documentation: PropTypes.string,
      link: PropTypes.string,
    }),
    baseUri: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  };

  state = {
    badgeUri: null,
    link: null,
    style: 'flat',
  };

  get isOpen() {
    return this.props.example !== null;
  }

  componentWillReceiveProps(nextProps) {
    const { example, baseUri } = nextProps;

    if (! example) {
      return;
    }

    // Transfer `badgeUri` and `link` into state so they can be edited by the
    // user.
    const { exampleUri, previewUri, link } = example;
    this.setState({
      badgeUri: resolveBadgeUrl(exampleUri || previewUri, baseUri || window.location.href),
      link,
    });
  }

  generateCompleteBadgeUrl() {
    const { baseUri } = this.props;
    const { badgeUri, style } = this.state;

    return resolveBadgeUrl(
      badgeUri,
      baseUri || window.location.href,
      // Default style doesn't need to be specified.
      style === 'flat' ? undefined : { style });
  }

  generateMarkup() {
    if (! this.isOpen) {
      return {};
    }

    const { title } = this.props.example;
    const { link } = this.state;
    const completeBadgeUrl = this.generateCompleteBadgeUrl();
    return generateAllMarkup(completeBadgeUrl, link, title);
  }

  renderDocumentation() {
    if (! this.isOpen) {
      return null;
    }

    const { documentation } = this.props.example;
    return documentation ? (
      <div>
        <h4>Documentation</h4>
        <div dangerouslySetInnerHTML={{ __html: documentation }} />
      </div>
    ) : null;
  }

  render() {
    const { markdown, reStructuredText, asciiDoc } = this.generateMarkup();

    const completeBadgeUrl = this.isOpen ? this.generateCompleteBadgeUrl() : undefined;

    return (
      <Modal
        isOpen={this.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel="Example Modal">
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
                onChange={event => { this.setState({ link: event.target.value }); }} />
            </label>
          </p>
          <p>
            <label>
              Image&nbsp;
              <input
                type="url"
                value={this.state.badgeUri}
                onChange={event => { this.setState({ badgeUri: event.target.value }); }} />
            </label>
          </p>
          <p>
            <label>
              Style&nbsp;
              <select
                value={this.state.style}
                onChange={event => { this.setState({ style: event.target.value }); }}>
                {
                  advertisedStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))
                }
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
              <input className="code clickable" readOnly value={reStructuredText} />
            </ClickToSelect>
          </p>
          <p>
            AsciiDoc&nbsp;
            <ClickToSelect>
              <input className="code clickable" readOnly value={asciiDoc} />
            </ClickToSelect>
          </p>
          {
            this.renderDocumentation()
          }
        </form>
      </Modal>
    );
  }
}
