export function formatNumber(num: number): string {
  num = parseFloat(num.toFixed(2));
  const [integerPart, decimalPart = '00'] = num.toString().split('.');

  // Add thousand separators to the integer part
  const formattedInteger = integerPart
    .split('')
    .reverse()
    .join('')
    .match(/.{1,3}/g)
    ?.join('.')
    .split('')
    .reverse()
    .join('');

  const formattedDecimal = decimalPart.padEnd(2, '0').slice(0, 2);

  return `${formattedInteger},${formattedDecimal}`;
};

export function formatDate(dateString: string): string {
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split('-');
  const date = new Date(`${month}/${day}/${year} ${timePart}`);
  return date.toLocaleString();
}