import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import styled from 'styled-components'
import { BaseFont } from '../common'
import MarkupModalContent from './markup-modal-content'

const ContentContainer = styled(BaseFont)`
  text-align: center;
`

export default class MarkupModal extends React.Component {
  static propTypes = {
    // This is an item from the `examples` array within the
    // `serviceDefinition` schema.
    // https://github.com/badges/shields/blob/master/services/service-definitions.js
    example: PropTypes.object,
    baseUrl: PropTypes.string.isRequired,
    onRequestClose: PropTypes.func.isRequired,
  }

  get isOpen() {
    return this.props.example !== undefined
  }

  render() {
    const { isOpen } = this
    const { onRequestClose, example, baseUrl } = this.props

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Example Modal"
        ariaHideApp={false}
      >
        {isOpen && (
          <ContentContainer>
            <MarkupModalContent example={example} baseUrl={baseUrl} />
          </ContentContainer>
        )}
      </Modal>
    )
  }
}
