export const formatter = (price: number | string, currency?: string) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
  });

  return formatter.format(Number(price) / 100);
};
