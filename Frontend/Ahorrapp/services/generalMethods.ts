export function formatNumber(num: number): string { // num: 1234567.89 -> '1.234.567,89'
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

export const parseDate = (dateString: string) => { // dateString: '2021-09-01 12:00' -> Date
  const [datePart, timePart] = dateString.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  const parsedDate = new Date(year, month - 1, day, hour, minute, 0);
  parsedDate.setHours(parsedDate.getHours() - 3);

  return parsedDate;
};

export const formatDate = (date: string) => { // date: '2021-09-01 12:00' -> '01/09/2021'
  date = date.split(' ')[0];
  const newDate = date.split('-').reverse().join('/');
  return newDate;
}

