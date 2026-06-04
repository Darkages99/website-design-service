import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const URL = process.env.SHOOT_URL || 'http://localhost:4317'
const out = (name) => join(__dirname, name)

const errors = []
const browser = await chromium.launch({ headless: true })

async function shoot(label, { width, height }, steps) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${label}] console.error: ${m.text()}`)
  })
  await page.goto(URL, { waitUntil: 'load', timeout: 20000 })
  await page.waitForTimeout(2200) // let fonts + intro + a few canvas frames settle
  await steps(page)
  await page.close()
}

await shoot('desktop', { width: 1440, height: 900 }, async (page) => {
  await page.screenshot({ path: out('desktop-1-hero.png') })
  await page.evaluate(() => document.querySelector('#programs')?.scrollIntoView())
  await page.waitForTimeout(1400)
  await page.screenshot({ path: out('desktop-2-programs.png') })
  await page.evaluate(() => document.querySelector('#testimonials')?.scrollIntoView())
  await page.waitForTimeout(1200)
  await page.screenshot({ path: out('desktop-3-testimonials.png') })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1600)
  await page.screenshot({ path: out('desktop-4-footer.png') })
})

await shoot('mobile', { width: 390, height: 844 }, async (page) => {
  await page.screenshot({ path: out('mobile-1-hero.png') })
})

await browser.close()

if (errors.length) {
  console.log('RUNTIME_ISSUES:\n' + errors.join('\n'))
} else {
  console.log('NO_RUNTIME_ERRORS')
}
console.log('DONE')
