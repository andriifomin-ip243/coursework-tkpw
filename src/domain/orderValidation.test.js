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

    expect(result).toEqual({ ok: true, errors: {}, value: validInput })
    expect(result.value).not.toHaveProperty('id')
    expect(input.quantity).toBe('2')
    expect(input.comment.startsWith('  ')).toBe(true)
  })

  test.each(['', '0', '1.5', '6'])('відхиляє некоректну кількість %j', (quantity) => {
    const result = validateOrder({ ...validInput, quantity }, [testItem])
    expect(result.ok).toBe(false)
    expect(result.errors.quantity).toBeTruthy()
  })

  test.each([1, 5])('приймає граничну кількість %i', (quantity) => {
    const result = validateOrder({ ...validInput, quantity }, [testItem])
    expect(result.ok).toBe(true)
  })

  test('для замовлень понад 3 одиниці вимагає фірмове пакування', () => {
    const result = validateOrder(
      { ...validInput, quantity: 4, giftPackaging: false },
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

  test.each([9, 301])('відхиляє коментар неприпустимої довжини %i', (length) => {
    const result = validateOrder(
      { ...validInput, comment: 'а'.repeat(length) },
      [testItem],
    )
    expect(result.ok).toBe(false)
    expect(result.errors.comment).toBeTruthy()
  })
})