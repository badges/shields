declare module '@mapbox/react-click-to-select' {
  import * as React from 'react'

  export type ContainerElementType = 'span' | 'div'

  export interface Props {
    containerElement?: ContainerElementType
  }

  export default class ClickToSelect extends React.Component<Props> {}
}
