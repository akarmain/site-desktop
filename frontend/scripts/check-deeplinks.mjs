// Guard the deep-link public contract: the exact ?window= / ?project= keys the
// site promises must exist in the data files. Fails loudly if a key/slug is
// renamed or dropped. Run: node scripts/check-deeplinks.mjs
import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const win = readFileSync(root + 'app/data/windows.ts', 'utf8')
const prj = readFileSync(root + 'app/data/projects.ts', 'utf8')

const WINDOW_KEYS = ['contacts', 'projects', 'stack', 'services', 'experience', 'terminal', 'settings']
const PROJECT_SLUGS = ['finbase', 'parser', 'dashboard', 'bot', 'crm']

const keys = [...win.matchAll(/key:\s*'([^']+)'/g)].map(m => m[1])
const slugs = [...prj.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1])

for (const k of WINDOW_KEYS) assert.ok(keys.includes(k), `missing ?window=${k}`)
for (const s of PROJECT_SLUGS) assert.ok(slugs.includes(s), `missing ?project=${s}`)
assert.equal(new Set(keys).size, keys.length, 'duplicate window key')
assert.equal(new Set(slugs).size, slugs.length, 'duplicate project slug')

console.log(`ok — ${keys.length} window keys, ${slugs.length} project slugs`)
