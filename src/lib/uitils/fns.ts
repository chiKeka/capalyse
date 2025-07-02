export function formatCurrency(
  value: number,
  minFD = 2,
  maxFD = 2,
  currency: string
) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency ?? 'NGN',
    maximumFractionDigits: maxFD,
    minimumFractionDigits: minFD,
  }).format(value);
}
