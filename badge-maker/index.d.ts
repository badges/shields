interface Format {
  label?: string
  message: string
  labelColor?: string
  color?: string
  style?: 'plastic' | 'flat' | 'flat-square' | 'for-the-badge' | 'social'
  logoBase64?: string
  /**
   * @deprecated This property would be deprecated in the future.
   */
  logoWidth?: number
  links?: Array<string>
}

export declare class ValidationError extends Error {}

export declare function makeBadge(format: Format): string
