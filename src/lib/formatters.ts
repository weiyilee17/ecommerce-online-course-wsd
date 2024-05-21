const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount);
}

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

export function formatNumber(num: number) {
  return NUMBER_FORMATTER.format(num);
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

export function formatDate(date: Date) {
  return DATE_FORMATTER.format(date);
}
