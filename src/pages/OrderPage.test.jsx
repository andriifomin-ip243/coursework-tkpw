import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import OrderPage from './OrderPage.jsx'
import { testItem, validInput, savedOrder } from '../test/fixtures.js'
import { deferred } from '../test/deferred.js'

function renderEditor(onSave) {
  return render(
    <OrderPage
      title="Нова чернетка передзамовлення"
      item={testItem}
      onSave={onSave}
      submitLabel="Створити чернетку"
      onCancel={vi.fn()}
    />,
  )
}

test('не зберігає порожню форму та виводить помилку валідації', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()

  renderEditor(onSave)

  await user.click(screen.getByRole('button', { name: 'Створити чернетку' }))

  const contact = screen.getByRole('textbox', { name: /Контакт для зв'язку/ })
  expect(contact).toHaveAttribute('aria-invalid', 'true')
  expect(contact).toHaveFocus()
  expect(
    screen.getByText("Вкажіть контакт для зв'язку (Telegram або телефон)."),
  ).toBeInTheDocument()
  expect(onSave).not.toHaveBeenCalled()
})

async function fillValidForm(user) {
  await user.type(
    screen.getByRole('textbox', { name: /Контакт для зв'язку/ }),
    validInput.contact,
  )
  const quantityInput = screen.getByRole('spinbutton', { name: /Кількість одиниць/ })
  await user.clear(quantityInput)
  await user.type(quantityInput, '2')

  await user.click(
    screen.getByRole('checkbox', { name: /Фірмове подарункове пакування MERA/ }),
  )

  await user.type(
    screen.getByRole('textbox', { name: /Деталі та розмір/ }),
    validInput.comment,
  )
}

test('передає нормалізовані поля й блокує повторне подання до отримання відповіді', async () => {
  const user = userEvent.setup()
  const pending = deferred()
  const onSave = vi.fn().mockReturnValue(pending.promise)

  renderEditor(onSave)
  await fillValidForm(user)

  await user.click(screen.getByRole('button', { name: 'Створити чернетку' }))

  const submit = screen.getByRole('button', { name: 'Збереження передзамовлення…' })
  expect(submit).toBeDisabled()
  expect(screen.getByRole('textbox', { name: /Контакт для зв'язку/ })).toBeDisabled()

  await user.click(submit)
  expect(onSave).toHaveBeenCalledTimes(1)
  expect(onSave).toHaveBeenCalledWith(validInput)

  await act(async () => {
    pending.resolve({ ok: true, record: savedOrder })
    await pending.promise
  })

  expect(screen.getByRole('button', { name: 'Створити чернетку' })).toBeEnabled()
})

test('після відмови сервісу зберігає введення чернетки й дозволяє повторити дію', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
    .mockResolvedValueOnce({ ok: false, message: 'Сервіс тимчасово недоступний.' })
    .mockResolvedValueOnce({ ok: true, record: savedOrder })

  renderEditor(onSave)
  await fillValidForm(user)

  await user.click(screen.getByRole('button', { name: 'Створити чернетку' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Сервіс тимчасово недоступний.',
  )

  expect(screen.getByRole('textbox', { name: /Контакт для зв'язку/ }))
    .toHaveValue(validInput.contact)
  expect(screen.getByRole('spinbutton', { name: /Кількість одиниць/ }))
    .toHaveValue(2)
  expect(screen.getByRole('checkbox', { name: /Фірмове подарункове пакування MERA/ }))
    .toBeChecked()
  expect(screen.getByRole('textbox', { name: /Деталі та розмір/ }))
    .toHaveValue(validInput.comment)

  await user.click(screen.getByRole('button', { name: 'Створити чернетку' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Створити чернетку' })).toBeEnabled()
  })

  expect(onSave).toHaveBeenCalledTimes(2)
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})