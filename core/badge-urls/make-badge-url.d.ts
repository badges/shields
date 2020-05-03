export function badgeUrlFromPath({
  baseUrl,
  path,
  queryParams,
  style,
  format,
  longCache,
}: {
  baseUrl?: string
  path: string
  queryParams: { [k: string]: string | number | boolean }
  style?: string
  format?: string
  longCache?: boolean
}): string

export function badgeUrlFromPattern({
  baseUrl,
  pattern,
  namedParams,
  queryParams,
  style,
  format,
  longCache,
}: {
  baseUrl?: string
  pattern: string
  namedParams: { [k: string]: string }
  queryParams: { [k: string]: string | number | boolean }
  style?: string
  format?: string
  longCache?: boolean
}): string

export function encodeField(s: string): string

export function staticBadgeUrl({
  baseUrl,
  label,
  message,
  labelColor,
  color,
  style,
  namedLogo,
  format,
  links,
}: {
  baseUrl?: string
  label: string
  message: string
  labelColor?: string
  color?: string
  style?: string
  namedLogo?: string
  format?: string
  links?: string[]
}): string

export function queryStringStaticBadgeUrl({
  baseUrl,
  label,
  message,
  color,
  labelColor,
  style,
  namedLogo,
  logoColor,
  logoWidth,
  logoPosition,
  format,
}: {
  baseUrl?: string
  label: string
  message: string
  color?: string
  labelColor?: string
  style?: string
  namedLogo?: string
  logoColor?: string
  logoWidth?: number
  logoPosition?: number
  format?: string
}): string

export function dynamicBadgeUrl({
  baseUrl,
  datatype,
  label,
  dataUrl,
  query,
  prefix,
  suffix,
  color,
  style,
  format,
}: {
  baseUrl?: string
  datatype: string
  label: string
  dataUrl: string
  query: string
  prefix: string
  suffix: string
  color?: string
  style?: string
  format?: string
}): string

export function rasterRedirectUrl(
  { rasterUrl }: { rasterUrl: string },
  badgeUrl: string
): string
