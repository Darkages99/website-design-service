import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const URL = process.env.SHOOT_URL || 'http://localhost:4317'
const out = (n) => join(__dirname, n)

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
})
await page.goto(URL, { waitUntil: 'load', timeout: 20000 })
await page.waitForTimeout(1800)

const tiger = page.locator('.gold-tiger')
await tiger.screenshot({ path: out('tiger-neutral.png') })

// force a snarl and capture the bared-fangs state
await page.evaluate(() => document.querySelector('.gold-tiger')?.classList.add('is-snarling'))
await page.waitForTimeout(400)
await tiger.screenshot({ path: out('tiger-snarl.png') })

await browser.close()
console.log('TIGER_DONE')
