const t = (function() {
  export default __a;
}())

t.create('on gitter').get('/nwjs/nw.js.json').expectBadge({
  label: 'chat',
  message: 'on gitter',
})
