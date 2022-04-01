export function koPriceLabelFormat(price: number) {
  if (!price) return '';

  const units = [
    '원',
    '만',
    '억',
    '조',
    '경',
    '해',
    '자',
    '양',
    '구',
    '간',
    '정',
    '재',
    '극',
    '항하사',
    '아승기',
    '나유타',
    '불가사의',
    '무량수'
  ];

  let unitIndex = 0;
  let scaledValue = price;

  while (scaledValue >= 10000 && unitIndex < units.length - 1) {
    unitIndex += 1;
    scaledValue /= 10000;
  }

  return `${Number(
    scaledValue.toFixed().length === 1 ? scaledValue.toFixed(2) : scaledValue.toFixed()
  ).toLocaleString()}${units[unitIndex]}`;
}

export const krwRegex = /^krw-/i;
export const usdtRegex = /^usdt-/i;
export const btcRegex = /^btc-/i;
