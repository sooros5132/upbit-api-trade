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

export function timeForToday(date: Date) {
  const today = new Date();
  const timeValue = date;

  const seconds = Math.floor((today.getTime() - timeValue.getTime()) / 1000);
  if (seconds < 59) return `${seconds}초 전`;

  const betweenTime = Math.floor(seconds / 60);
  if (betweenTime < 60) {
    return `${betweenTime}분 전`;
  }

  const betweenTimeHour = Math.floor(betweenTime / 60);
  if (betweenTimeHour < 24) {
    return `${betweenTimeHour}시간 전`;
  }

  const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
  if (betweenTimeDay < 365) {
    return `${betweenTimeDay}일 전`;
  }

  return `${Math.floor(betweenTimeDay / 365)}년 전`;
}
