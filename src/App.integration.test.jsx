import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.jsx'
import { orderService } from './services/orderService.js'
import { ServiceError } from './services/ServiceError.js'
import { savedOrder, validInput } from './test/fixtures.js'
import { deferred } from './test/deferred.js'

vi.mock('./services/orderService.js', () => ({
  orderService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => {
  for (const method of Object.values(orderService)) {
    method.mockReset()
  }
  orderService.getAll.mockResolvedValue([{ ...savedOrder }])
  orderService.getById.mockResolvedValue({ ...savedOrder })
  orderService.create.mockImplementation(async (input) => ({
    ...input,
    id: 'ord-created',
  }))
  orderService.update.mockImplementation(async (id, input) => ({
    ...input,
    id,
  }))
  orderService.delete.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="location">
      {location.pathname}{location.search}
    </div>
  )
}

function renderApp(path = '/orders') {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[path]}>
      <LocationProbe />
      <App />
    </MemoryRouter>,
  )
  return user
}

test('показує завантаження до отримання списку передзамовлень', async () => {
  const pending = deferred()
  orderService.getAll.mockReturnValueOnce(pending.promise)

  renderApp()

  expect(screen.getByText('Завантаження передзамовлень MERA…')).toBeInTheDocument()
  expect(screen.queryByText(savedOrder.comment)).not.toBeInTheDocument()

  await act(async () => {
    pending.resolve([savedOrder])
    await pending.promise
  })

  expect(await screen.findByText(savedOrder.comment)).toBeInTheDocument()
  expect(screen.queryByText('Завантаження передзамовлень MERA…')).not.toBeInTheDocument()
})

test('після відмови читання дозволяє повторно завантажити дані', async () => {
  orderService.getAll
    .mockRejectedValueOnce(new ServiceError('Навчальна відмова читання.'))
    .mockResolvedValueOnce([savedOrder])

  const user = renderApp()

  expect(await screen.findByRole('alert')).toHaveTextContent('Навчальна відмова читання.')
  expect(screen.queryByText(savedOrder.comment)).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Спробувати ще раз' }))

  expect(await screen.findByText(savedOrder.comment)).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('успішний порожній список показує відповідне повідомлення', async () => {
  orderService.getAll.mockResolvedValueOnce([])

  renderApp()

  expect(
    await screen.findByText(/У поточному сховищі ще немає збережених заявок/),
  ).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.queryByRole('table')).not.toBeInTheDocument()
})

test('скасування діалогу не надсилає команду на видалення', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(false)

  const user = renderApp('/orders/ord-test-001')

  await screen.findByRole('heading', { name: 'Заявка ord-test-001' })
  await user.click(screen.getByRole('button', { name: 'Видалити заявку' }))

  expect(orderService.delete).not.toHaveBeenCalled()
  expect(screen.getByRole('heading', { name: 'Заявка ord-test-001' })).toBeInTheDocument()
})

test('створює заявку та відкриває її підтверджені деталі за новим ідентифікатором', async () => {
  orderService.getAll.mockResolvedValueOnce([])

  const user = renderApp(`/orders/new?productId=${validInput.productId}`)

  const contact = await screen.findByRole('textbox', { name: /Контакт для зв'язку/ })
  await user.type(contact, validInput.contact)

  const quantity = screen.getByRole('spinbutton', { name: /Кількість одиниць/ })
  await user.clear(quantity)
  await user.type(quantity, '2')

  await user.click(
    screen.getByRole('checkbox', { name: /Фірмове подарункове пакування MERA/ }),
  )

  await user.type(
    screen.getByRole('textbox', { name: /Деталі та розмір/ }),
    validInput.comment,
  )

  await user.click(screen.getByRole('button', { name: 'Створити чернетку' }))

  expect(await screen.findByRole('heading', { name: 'Заявка ord-created' })).toBeInTheDocument()
  expect(screen.getByTestId('location')).toHaveTextContent('/orders/ord-created')
  expect(screen.getByText(validInput.comment)).toBeInTheDocument()
  expect(orderService.create).toHaveBeenCalledTimes(1)
  expect(orderService.create).toHaveBeenCalledWith(validInput)
})