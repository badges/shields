import config from 'config';
const objectConfig = config.util.toObject()
console.log(objectConfig)
import GithubConstellation from '../services/github/github-constellation.js';

const { persistence } = new GithubConstellation({
  service: objectConfig.public.services.github,
  private: objectConfig.private,
})

async function main() {
  const tokens = await persistence.initialize()
  console.log(`${tokens.length} tokens loaded`)
  await persistence.stop()
}

(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
