function getColorOfBadge(number) {
  return number > 0 ? 'brightgreen' : number === 0 ? 'orange' : 'red'
}

export default getColorOfBadge
