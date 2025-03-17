export const formatCurrency = (value, options = {}) => {
  if (!value) return '0.00';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
    ...options
  });

  return formatter.format(value);
};

export const formatNumber = (value, options = {}) => {
  if (!value) return '0';

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  });

  return formatter.format(value);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const shortenAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const formatPrice = (value, currency) => {
    if (typeof value !== 'number') return '-';

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency === 'XLM' ? 'XLM' : 'USD',
        minimumFractionDigits: value < 0.01 ? 8 : 2,
        maximumFractionDigits: value < 0.01 ? 8 : 2
    });

    return formatter.format(value).replace('XLM', '');
}; 