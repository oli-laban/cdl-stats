import puppeteer, {
  Browser,
  ClickOptions,
  HTTPResponse,
  Page,
  PuppeteerLaunchOptions,
} from 'puppeteer'
import { wait } from '../util.js'

let _browser: Browser | null = null

const disconnectListener = (): void =>
  console.warn('Browser has been disconnected')

export const browser = async (
  useBrowser: Browser | null = null,
): Promise<Browser> => {
  if (_browser) {
    return _browser
  }

  console.log('Launching browser...')

  const options: PuppeteerLaunchOptions = {
    headless: false,
    defaultViewport: { width: 1600, height: 900 },
  }

  _browser = useBrowser || (await puppeteer.launch(options))

  console.log('Browser has been launched.')

  _browser.once('disconnected', disconnectListener)

  return _browser
}

export const closeBrowser = async (): Promise<void> => {
  await (await browser()).off('disconnected', disconnectListener).close()
}

export const newPage = async (): Promise<Page> => {
  const page = await (await browser()).newPage()

  page.on('pageerror', (error) =>
    console.warn(`Page error: "${error.message}."`),
  )
  page.on('load', () => console.log(`Page loaded: "${page.url()}".`))
  page.on('console', (message) => console.log(`Console log: ${message.text()}`))

  return page
}

export const isNotPreflight = (response: HTTPResponse): boolean =>
  response.request().method().toUpperCase() !== 'OPTIONS'

export const waitAndClick = async (
  page: Page,
  selector: string,
  options: ClickOptions = {},
): Promise<void> => {
  await page.waitForSelector(selector)
  await wait(1000)
  await page.click(selector, options)
}
