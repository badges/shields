// Everything that cannot be checked in but is useful server-side is stored in
// a JSON data file: private/secret.json.

const fs = require('fs');
const path = require('path');

const secretsPath = path.join(__dirname, '..', 'private', 'secret.json');

if (fs.existsSync(secretsPath)) {
  try {
    module.exports = require(secretsPath);
  } catch(e) {
    console.error(`Error loading secret data: ${e.message}`);
    process.exit(1);
  }
} else {
  console.warn(`No secret data found at ${secretsPath} (see lib/server-secrets.js)`);
}
