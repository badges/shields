import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import styled from 'styled-components'
import { examplePropType } from '../../lib/service-definitions/service-definition-prop-types'
import { BaseFont } from '../common'
import MarkupModalContent from './markup-modal-content'

const ContentContainer = styled(BaseFont)`
  text-align: center;
`

export default class MarkupModal extends React.Component {
  static propTypes = {
    example: examplePropType,
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
