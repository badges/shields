import {isVPlusTripleDottedVersion} from '../test-validators.js';
const t = (function() {
  export default __a;
}())

t.create('version').get('/v/conda-forge/zlib.json').expectBadge({
  label: 'conda|conda-forge',
  message: isVPlusTripleDottedVersion,
})

t.create('version (skip prefix)').get('/vn/conda-forge/zlib.json').expectBadge({
  label: 'conda-forge',
  message: isVPlusTripleDottedVersion,
})
