import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import ClickToSelect from '@mapbox/react-click-to-select';
import { resolveUri } from './badge-examples';
import generateAllMarkup from '../lib/generate-image-markup';

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
      badgeUri: resolveUri(exampleUri || previewUri, baseUri || window.location.href),
      link,
    });
  }

  generateMarkup() {
    if (! this.isOpen) {
      return {};
    }

    const { baseUri } = this.props;
    const { title } = this.props.example;
    const { badgeUri, link, style } = this.state;

    const withStyle = new URL(badgeUri, baseUri || window.location.href);
    if (style !== 'flat') { // Default style doesn't need to be specified.
      withStyle.searchParams.set('style', style);
    }

    return generateAllMarkup(withStyle.href, link, title);
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

    return (
      <Modal
        isOpen={this.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel="Example Modal">
        <form action="">
          <p>
            <img className="badge-img" src={this.state.badgeUri} />
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
                <option value="plastic">plastic</option>
                <option value="flat">flat</option>
                <option value="flat-square">flat-square</option>
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
