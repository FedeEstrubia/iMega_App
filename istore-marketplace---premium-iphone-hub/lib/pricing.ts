
/**
 * Calculates the discounted price in USD based on level.
 * Redondeo: SIEMPRE hacia arriba a entero (ceil).
 */
export const getDiscountedUSD = (basePrice: number, discountPercent: number): number => {
  const discount = (basePrice * discountPercent) / 100;
  return Math.ceil(basePrice - discount);
};

/**
 * Calculates the ARS price based on the blue exchange rate.
 */
export const getARS = (usdPrice: number, blueRate: number): number => {
  return Math.ceil(usdPrice * blueRate);
};

/**
 * Formats numbers as currency.
 */
export const formatCurrency = (amount: number, currency: 'USD' | 'ARS'): string => {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'es-AR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
