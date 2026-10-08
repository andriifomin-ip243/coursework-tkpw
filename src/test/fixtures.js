import { apparelItems } from '../data/items.js'

export const testItem = apparelItems[0]

export const validInput = {
  productId: testItem.id,
  contact: '@famidez_tg',
  quantity: 2,
  giftPackaging: true,
  comment: 'Розмір L. Друк з двох сторін, доставка до Івано-Франківська.',
}

export const savedOrder = {
  ...validInput,
  id: 'ord-test-001',
}