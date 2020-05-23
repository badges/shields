interface Format {
  label?: string
  message: string
  labelColor?: string
  color?: string
  style?: 'plastic' | 'flat' | 'flat-square' | 'for-the-badge' | 'social'
}

export declare class ValidationError extends Error {}

export declare function makeBadge(format: Format): string
