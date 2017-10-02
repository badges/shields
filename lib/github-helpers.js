'use strict';

function stateColor(s) {
  return { open: '2cbe4e', closed: 'cb2431', merged: '6f42c1' }[s];
}

function checkStateColor(s) {
  return { pending: 'dbab09', success: '2cbe4e', failure: 'cb2431', error: 'cb2431' }[s];
}

// FIXME w/f https://github.com/badges/shields/pull/1112
// const commentsColor = colorScale([1, 3, 10, 25], undefined, true);
function commentsColor() {
  return undefined;
}


module.exports = {
  stateColor,
  checkStateColor,
  commentsColor
};
