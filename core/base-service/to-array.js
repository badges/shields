export default function toArray(val) {
  if (val === undefined) {
    return []
  } else if (Object(val) instanceof Array) {
    return val
  } else {
    return [val]
  }
}
