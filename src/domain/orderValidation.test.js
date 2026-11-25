import { describe, expect, test } from 'vitest'
import { validateOrder } from './orderValidation.js'
import { testItem, validInput } from '../test/fixtures.js'

describe('validateOrder', () => {
  test('нормалізує коректні поля, не змінюючи вихідний об’єкт', () => {
    const input = Object.freeze({
      ...validInput,
      comment: `  ${validInput.comment}  `,
      quantity: '2',
      id: 'injected-id',
    })

    const result = validateOrder(input, [testItem])

    expect(result).toEqual({
      ok: true,
      errors: {},
      value: expect.objectContaining({
        productId: validInput.productId,
        contact: validInput.contact,
        quantity: 2,
        giftPackaging: validInput.giftPackaging,
        comment: validInput.comment,
      }),
    })
    expect(result.value).not.toHaveProperty('id')
    expect(input.quantity).toBe('2')
    expect(input.comment.startsWith('  ')).toBe(true)
  })

  test.each(['', '0', '1.5', '21'])('відхиляє некоректну кількість %j', (quantity) => {
    const result = validateOrder({ ...validInput, quantity }, [testItem])
    expect(result.ok).toBe(false)
    expect(result.errors.quantity).toBeTruthy()
  })

  test.each([1, 20])('приймає граничну кількість %i', (quantity) => {
    const result = validateOrder({ ...validInput, quantity }, [testItem])
    expect(result.ok).toBe(true)
  })

  test('для замовлень понад 10 одиниць вимагає фірмове пакування', () => {
    const result = validateOrder(
      { ...validInput, quantity: 11, giftPackaging: false },
      [testItem],
    )
    expect(result.ok).toBe(false)
    expect(result.errors.giftPackaging).toBeTruthy()
  })

  test('відхиляє неіснуючий у каталозі виріб', () => {
    const result = validateOrder(
      { ...validInput, productId: 'mera-missing' },
      [testItem],
    )
    expect(result.ok).toBe(false)
    expect(result.errors.productId).toBeTruthy()
  })

  test.each([9, 1001])('відхиляє коментар неприпустимої довжини %i', (length) => {
    const result = validateOrder(
      { ...validInput, comment: 'а'.repeat(length) },
      [testItem],
    )
    expect(result.ok).toBe(false)
    expect(result.errors.comment).toBeTruthy()
  })
})