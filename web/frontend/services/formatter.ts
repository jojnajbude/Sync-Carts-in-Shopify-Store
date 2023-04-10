export const formatter = (price: number, currency: string) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
  });

  return formatter.format(price);
};
