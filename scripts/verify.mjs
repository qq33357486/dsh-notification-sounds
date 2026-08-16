#!/usr/bin/env node
/**
 * Offline smoke verification for dsh-ui-notify.
 *
 * Checks the packaging contract — the cordis.patch.yml row name must equal the
 * package name (a mismatch fails only after install, when the row fails to
 * import) — and that both built halves are present and loadable: the node half
 * (`lib/index.js`) imports in plain Node, and the client bundle (`lib/client.js`)
 * is a `__ModuleLoader__` closure-factory carrying the package id. Requires a
 * prior `pnpm build` or `pnpm prepare` (lib/ present). Does not touch any
 * running DSH instance or profile.
 *
 * Usage: node scripts/verify.mjs
 */

import { readFile, access } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

let failures = 0
function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${label}`)
  } else {
    failures += 1
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

console.log('dsh-notification-sounds offline verification')

// 1/4 packaging contract: patch row name === package name
console.log('1/4 packaging contract')
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const patchText = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
check('package name is the patch row name', patchText.includes(`name: ${pkg.name}`), pkg.name)

// 2/4 node half present and importable
console.log('2/4 node half')
const nodePath = fileURLToPath(new URL('../lib/index.js', import.meta.url))
try {
  await access(nodePath)
  const nodeMod = await import(pathToFileURL(nodePath).href)
  check('node half exports an apply function', typeof nodeMod.apply === 'function')
} catch (error) {
  check('node half imports', false, error instanceof Error ? error.message : String(error))
}

// 3/4 client bundle present and a __ModuleLoader__ closure-factory
console.log('3/4 client bundle')
const clientPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
try {
  const clientText = await readFile(clientPath, 'utf8')
  check('client bundle registers under the package id', clientText.includes(`id: ${JSON.stringify(pkg.name)}`))
  check('client bundle is a __ModuleLoader__ closure', clientText.includes('__ModuleLoader__.load'))
} catch (error) {
  check('client bundle readable', false, error instanceof Error ? error.message : String(error))
}

// 4/4 dsh manifest carries the two roles the loader needs
console.log('4/4 dsh manifest')
check('dsh.bundle.patch declared', pkg.dsh?.bundle?.patch === './cordis.patch.yml')
check('dsh.client platform is web', pkg.dsh?.client?.platform === 'web')
check('client export declared', typeof pkg.exports?.['./client']?.default === 'string')

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log('\nAll offline checks passed')
