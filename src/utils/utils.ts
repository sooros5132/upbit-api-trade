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

/**
 * ### 업비트 주문가격 보정
 * @param price 기준 가격
 * @returns 보정된 가격
 */
export function priceCorrection(price: number) {
  // 최소 호가 (이상)		최대 호가 (미만)	주문 가격 단위 (원)
  // 2,000,000											1,000
  // 1,000,000				2,000,000			500
  // 500,000					1,000,000			100
  // 100,000					500,000				50
  // 10,000						100,000				10
  // 1,000						10,000				5
  // 100							1,000					1
  // 10								100						0.1
  // 1								10						0.01
  // 0.1							1							0.001
  // 0								0.1						0.0001
  switch (true) {
    case 2000000 <= price: {
      return price - (price % 1000);
    }
    case 1000000 <= price && price < 2000000: {
      return price - (price % 500);
    }
    case 500000 <= price && price < 1000000: {
      return price - (price % 100);
    }
    case 100000 <= price && price < 500000: {
      return price - (price % 50);
    }
    case 10000 <= price && price < 100000: {
      return price - (price % 10);
    }
    case 1000 <= price && price < 10000: {
      return price - (price % 5);
    }
    case 100 <= price && price < 1000: {
      return Number(price.toFixed(0));
    }
    case 10 <= price && price < 100: {
      return Number(price.toFixed(1));
    }
    case 1 <= price && price < 10: {
      return Number(price.toFixed(2));
    }
    case 0.1 <= price && price < 1: {
      return Number(price.toFixed(3));
    }
    case 0 < price && price <= 0.1: {
      return Number(price.toFixed(4));
    }
    default: {
      return 0;
    }
  }
}

/**
 * ### 퍼센트 계산기
 *
 * 부동소수점 오류는 처리하지 않음
 *
 * 감소 계산은 percent를 음수로
 *
 * `(10.1, 4) = 0.40399999999999997`
 *
 * @param price 기준값
 * @param percent 계산할 퍼센트 (소수 x)
 */
export function percentageCalculator(price: number, percent: number) {
  return price * (1 + percent / 100);
}

/**
 * ### 비율 계산기
 *
 * @param price 기준값
 * @param percent 계산할 퍼센트 (소수 x)
 */
export function percentRatio(price: number, percent: number) {
  return price * (percent / 100);
}
