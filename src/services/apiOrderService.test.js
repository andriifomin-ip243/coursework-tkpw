import { afterEach, expect, test, vi } from 'vitest'
import { createApiOrderService } from './apiOrderService.js'
import { savedOrder } from '../test/fixtures.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

test('відхиляє HTTP 404 замість удаваного успіху', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 }))
  vi.stubGlobal('fetch', fetchMock)

  const service = createApiOrderService('https://example.test/api')

  await expect(service.getById('missing')).rejects.toMatchObject({
    code: 'NOT_FOUND',
    status: 404,
  })

  expect(fetchMock).toHaveBeenCalledWith(
    'https://example.test/api/orders/missing',
    expect.objectContaining({ method: 'GET' }),
  )
})

test('після DELETE 204 не намагається читати JSON', async () => {
  const response = new Response(null, { status: 204 })
  const readJson = vi.spyOn(response, 'json')
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)

  const service = createApiOrderService('https://example.test/api')

  await expect(service.delete('ord-test-001')).resolves.toBeUndefined()
  expect(readJson).not.toHaveBeenCalled()
  expect(fetchMock).toHaveBeenCalledWith(
    'https://example.test/api/orders/ord-test-001',
    expect.objectContaining({ method: 'DELETE' }),
  )
})

test.each([
  { label: 'неправильна оболонка', body: { items: [] } },
  { label: 'некоректний тип кількості', body: [{ ...savedOrder, quantity: 'two' }] },
  { label: 'повторний ідентифікатор', body: [savedOrder, { ...savedOrder }] },
])('відхиляє несумісну структуру відповіді: $label', async ({ body }) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )

  const service = createApiOrderService('https://example.test/api')

  await expect(service.getAll()).rejects.toMatchObject({
    code: 'BAD_DATA',
  })
})