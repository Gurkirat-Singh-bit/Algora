import { expect, test } from '@playwright/test'

const routes = [
  '/',
  '/learn',
  '/learn/arrays',
  '/arrays',
  '/singly-linked-list',
  '/doubly-linked-list',
  '/circular-linked-list',
  '/stack',
  '/queue',
  '/recursion',
  '/searching',
  '/sorting',
  '/binary-tree',
  '/bst',
  '/heap',
  '/graphs',
  '/hash-table',
  '/trie',
  '/union-find',
]

async function waitForHydration(page: import('@playwright/test').Page) {
  await page.locator('html[data-hydrated="true"]').waitFor({ state: 'attached' })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
  })
})

test('all public routes render without page exceptions', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
    expect(response?.status(), route).toBe(200)
    await waitForHydration(page)
    await expect(page.locator('body')).not.toBeEmpty()
  }

  expect(pageErrors).toEqual([])
})

test('document layout stays inside a narrow mobile viewport', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'))

  for (const route of ['/learn', '/arrays', '/graphs', '/hash-table', '/trie', '/union-find']) {
    await page.goto(route)
    await waitForHydration(page)
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }))
    expect(dimensions.document, `${route} overflows the page`).toBeLessThanOrEqual(dimensions.viewport + 1)
  }
})

test('mobile navigation exposes every new learning topic', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'))
  await page.goto('/arrays')
  await waitForHydration(page)
  await page.getByRole('button', { name: 'Open navigation' }).click()

  await expect(page.getByRole('link', { name: 'Hash Table' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Trie' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Disjoint Set' })).toBeVisible()
})

test('graph editor exposes connectors and adds a node', async ({ page }) => {
  await page.goto('/graphs')
  await waitForHydration(page)
  await page.getByRole('button', { name: 'Edit', exact: true }).click()

  const nodes = page.locator('.react-flow__node')
  const countBefore = await nodes.count()
  await expect(page.locator('.react-flow__handle.source').first()).toBeVisible()

  await page.getByRole('button', { name: 'Add Node' }).click()
  await expect(nodes).toHaveCount(countBefore + 1)
  await expect(page.getByText(/Added node \d+/)).toBeVisible()
})

test('new visualizers generate synchronized traces', async ({ page }) => {
  await page.goto('/hash-table')
  await waitForHydration(page)
  await page.getByLabel('Integer key').fill('25')
  await page.getByRole('button', { name: 'Insert key' }).click()
  await expect(page.getByText(/Hash 25 to bucket/)).toBeVisible()

  await page.goto('/trie')
  await waitForHydration(page)
  await page.getByLabel('Word').fill('cart')
  await page.getByRole('button', { name: 'Insert word' }).click()
  await expect(page.getByText(/Start at the root for "cart"/)).toBeVisible()

  await page.goto('/union-find')
  await waitForHydration(page)
  await page.getByLabel('First value').fill('1')
  await page.getByLabel('Second value').fill('3')
  await page.getByRole('button', { name: 'Union values' }).click()
  await expect(page.getByText(/Compare roots/)).toBeVisible()
})

test('collapsing the desktop sidebar releases workspace width', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'))
  await page.goto('/arrays')
  await waitForHydration(page)
  const workspace = page.locator('#main-content')
  const before = await workspace.evaluate(element => Number.parseFloat(getComputedStyle(element).paddingLeft))

  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible()
  const after = await workspace.evaluate(element => Number.parseFloat(getComputedStyle(element).paddingLeft))

  expect(after).toBeLessThan(before)
})
