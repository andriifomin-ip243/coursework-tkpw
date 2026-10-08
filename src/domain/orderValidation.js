export function validateOrder(input, items) {
  const errors = {}

  const contact = typeof input.contact === 'string'
    ? input.contact.trim()
    : ''

  const comment = typeof input.comment === 'string'
    ? input.comment.trim()
    : ''

  const quantityText = String(input.quantity ?? '').trim()
  const quantity = Number(quantityText)

  if (!items.some((item) => item.id === input.productId)) {
    errors.productId = 'Виберіть наявну річ із каталогу.'
  }

  if (contact.length === 0) {
    errors.contact = "Вкажіть контакт для зв'язку (Telegram або телефон)."
  } else if (contact.length < 5 || contact.length > 60) {
    errors.contact = "Контакт має містити від 5 до 60 символів."
  }

  if (comment.length === 0) {
    errors.comment = 'Вкажіть деталі замовлення (розмір, побажання тощо).'
  } else if (comment.length < 10 || comment.length > 300) {
    errors.comment = 'Коментар має містити від 10 до 300 символів без крайніх пробілів.'
  }

  if (quantityText === '') {
    errors.quantity = 'Вкажіть кількість одиниць.'
  } else if (
    !Number.isInteger(quantity)
    || quantity < 1
    || quantity > 5
  ) {
    errors.quantity = 'Кількість має бути цілим числом від 1 до 5.'
  }

  if (typeof input.giftPackaging !== 'boolean') {
    errors.giftPackaging = 'Ознака пакування має бути логічним значенням.'
  } else if (!errors.quantity && quantity > 3 && !input.giftPackaging) {
    errors.giftPackaging = 'Для замовлень понад 3 одиниці фірмове пакування є обов’язковим.'
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    errors: {},
    value: {
      productId: input.productId,
      contact,
      quantity,
      giftPackaging: input.giftPackaging,
      comment,
    },
  }
}