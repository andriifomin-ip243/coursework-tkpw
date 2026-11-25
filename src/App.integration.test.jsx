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

function renderApp(initialEntry = '/orders') {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
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
  expect(screen.queryByText(new RegExp(savedOrder.id))).not.toBeInTheDocument()

  await act(async () => {
    pending.resolve([savedOrder])
    await pending.promise
  })

  expect(await screen.findByText(new RegExp(savedOrder.id))).toBeInTheDocument()
  expect(screen.queryByText('Завантаження передзамовлень MERA…')).not.toBeInTheDocument()
})

test('після відмови читання дозволяє повторно завантажити дані', async () => {
  orderService.getAll
    .mockRejectedValueOnce(new ServiceError('Навчальна відмова читання.'))
    .mockResolvedValueOnce([savedOrder])

  const user = renderApp()

  expect(await screen.findByRole('alert')).toHaveTextContent('Навчальна відмова читання.')
  expect(screen.queryByText(new RegExp(savedOrder.id))).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Спробувати ще раз' }))

  expect(await screen.findByText(new RegExp(savedOrder.id))).toBeInTheDocument()
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
  await user.click(screen.getByRole('button', { name: 'Скасувати замовлення' }))

  expect(orderService.delete).not.toHaveBeenCalled()
  expect(screen.getByRole('heading', { name: 'Заявка ord-test-001' })).toBeInTheDocument()
})

test('створює заявку та відкриває її підтверджені деталі за новим ідентифікатором', async () => {
  orderService.getAll.mockResolvedValueOnce([])

  const user = renderApp({
    pathname: '/orders/new',
    search: `?productId=${validInput.productId}`,
    state: {
      cartItems: [
        {
          id: validInput.productId,
          name: 'Футболка "Street Toxic: Dragon"',
          price: 890,
          quantity: 2,
        },
      ],
    },
  })

  await user.type(
    await screen.findByLabelText(/ПІБ отримувача/),
    'Фомін Андрій Олександрович',
  )

  await user.type(
    screen.getByLabelText(/Номер телефону/),
    '956665555',
  )

  await user.type(
    screen.getByLabelText(/Відділення \/ поштомат/),
    'м. Івано-Франківськ, Відділення №1',
  )

  await user.click(screen.getByRole('button', { name: 'Підтвердити передзамовлення' }))

  expect(orderService.create).toHaveBeenCalledTimes(1)
  expect(orderService.create).toHaveBeenCalledWith(
    expect.objectContaining({
      productId: validInput.productId,
      contact: 'Фомін Андрій Олександрович | +380956665555',
      address: 'м. Івано-Франківськ, Відділення №1',
    }),
  )
  expect(await screen.findByText(/Мої замовлення/i)).toBeInTheDocument()
  expect(screen.getByTestId('location')).toHaveTextContent('/orders')
})