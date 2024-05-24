import { DiscountCodeType } from '@prisma/client';

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

const PERCENT_FORMATTER = new Intl.NumberFormat('en-US', { style: 'percent' });

export function formatDiscountCode(discountAmount: number, discountType: DiscountCodeType) {
  switch (discountType) {
    case DiscountCodeType.PERCENTAGE:
      return PERCENT_FORMATTER.format(discountAmount / 100);
    case DiscountCodeType.FIXED:
      return formatCurrency(discountAmount);

    default:
      // satisfies never gaurds not listing all cases in DiscountCodeType
      throw new Error(`Invalid discount code type ${discountType satisfies never}`);
  }
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDateTime(date: Date) {
  return DATE_TIME_FORMATTER.format(date);
}
