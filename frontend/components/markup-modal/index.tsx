import React from 'react'
import Modal from 'react-modal'
import styled from 'styled-components'
import { BaseFont } from '../common'
import { RenderableExample } from '../../lib/service-definitions'
import { MarkupModalContent } from './markup-modal-content'

const ContentContainer = styled(BaseFont)`
  text-align: center;
`

export function MarkupModal({
  example,
  isBadgeSuggestion,
  baseUrl,
  onRequestClose,
}: {
  example: RenderableExample | undefined
  isBadgeSuggestion: boolean
  baseUrl: string
  onRequestClose: () => void
}): JSX.Element {
  return (
    <Modal
      ariaHideApp={false}
      contentLabel="Example Modal"
      isOpen={example !== undefined}
      onRequestClose={onRequestClose}
    >
      {example !== undefined && (
        <ContentContainer>
          <MarkupModalContent
            baseUrl={baseUrl}
            example={example}
            isBadgeSuggestion={isBadgeSuggestion}
          />
        </ContentContainer>
      )}
    </Modal>
  )
}
