const t = (function() {
  export default __a;
}())

t.create('Nucleus (pluginId nucleus)').get('/nucleus.json').expectBadge({
  label: 'license',
  message: 'MIT licence',
})

t.create('Invalid Plugin (pluginId 1)').get('/1.json').expectBadge({
  label: 'license',
  message: 'not found',
})
