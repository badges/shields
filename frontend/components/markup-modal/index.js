import React from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import styled from 'styled-components'
import { examplePropType } from '../../lib/service-definitions/example-prop-types'
import { BaseFont } from '../common'
import MarkupModalContent from './markup-modal-content'

const ContentContainer = styled(BaseFont)`
  text-align: center;
`

export default function MarkupModal({ example, baseUrl, onRequestClose }) {
  const isOpen = example !== undefined

  return (
    <Modal
      ariaHideApp={false}
      contentLabel="Example Modal"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      {isOpen && (
        <ContentContainer>
          <MarkupModalContent baseUrl={baseUrl} example={example} />
        </ContentContainer>
      )}
    </Modal>
  )
}
MarkupModal.propTypes = {
  example: examplePropType,
  baseUrl: PropTypes.string.isRequired,
  onRequestClose: PropTypes.func.isRequired,
}
