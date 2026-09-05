export const formatCurrency = (value: string | number) => {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return 'PHP 0.00'
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}
