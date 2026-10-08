import { apparelItems } from '../data/items.js'
import { validateOrder } from '../domain/orderValidation.js'
import { ServiceError } from './ServiceError.js'

export function toOrderInput(input) {
  const result = validateOrder(input, apparelItems)
  if (!result.ok) {
    throw new ServiceError('Перевірте поля заявки.', {
      code: 'VALIDATION',
      errors: result.errors,
    })
  }
  return result.value
}

export function toOrder(value) {
  const valid = value !== null
    && typeof value === 'object'
    && typeof value.id === 'string'
    && value.id.length > 0
    && typeof value.productId === 'string'
    && typeof value.contact === 'string'
    && Number.isInteger(value.quantity)
    && typeof value.giftPackaging === 'boolean'
    && typeof value.comment === 'string'

  if (!valid) {
    throw new ServiceError('Джерело повернуло некоректний запис передзамовлення.', {
      code: 'BAD_DATA',
    })
  }

  return {
    id: value.id,
    productId: value.productId,
    contact: value.contact,
    quantity: value.quantity,
    giftPackaging: value.giftPackaging,
    comment: value.comment,
  }
}

export function toOrderList(value) {
  if (!Array.isArray(value)) {
    throw new ServiceError('Джерело повернуло некоректний список передзамовлень.', {
      code: 'BAD_DATA',
    })
  }

  const records = value.map(toOrder)
  if (new Set(records.map((record) => record.id)).size !== records.length) {
    throw new ServiceError('Джерело повернуло повторні ідентифікатори.', {
      code: 'BAD_DATA',
    })
  }

  return records
}