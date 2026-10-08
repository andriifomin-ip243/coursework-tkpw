import { expect, test } from 'vitest'
import { selectOrders } from './selectOrders.js'
import { testItem, savedOrder } from '../test/fixtures.js'

test('поєднує фільтрацію за пакуванням, текстовий пошук і порядок без мутації джерела', () => {
  const records = Object.freeze([
    Object.freeze({ ...savedOrder, id: 'ord-1', quantity: 4, giftPackaging: true }),
    Object.freeze({ ...savedOrder, id: 'ord-2', quantity: 1, giftPackaging: true }),
    Object.freeze({ ...savedOrder, id: 'ord-3', giftPackaging: false }),
  ])

  const result = selectOrders(records, [testItem], {
    query: '  ФРАНКІВСЬКА  ',
    packaging: 'gift',
    sort: 'quantity-asc',
  })

  expect(result.map((record) => record.id)).toEqual(['ord-2', 'ord-1'])
  expect(records.map((record) => record.id)).toEqual(['ord-1', 'ord-2', 'ord-3'])
})

test('відсутність збігів не видаляє початковий запис і повертає порожній масив', () => {
  const records = [savedOrder]
  const result = selectOrders(records, [testItem], {
    query: 'неіснуючий текст запиту',
    packaging: 'all',
    sort: 'product',
  })

  expect(result).toEqual([])
  expect(records).toEqual([savedOrder])
})