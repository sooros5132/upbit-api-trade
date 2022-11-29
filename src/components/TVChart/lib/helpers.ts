export function getNextBarOpenTime(barTime: number, resolution: string) {
  const date = new Date(barTime);
  switch (resolution) {
    case '3D': {
      date.setDate(date.getDate() + 7);
      break;
    }
    case '1W': {
      date.setDate(date.getDate() + 7);
      break;
    }
    case '1M': {
      date.setMonth(date.getMonth() + 1);
      break;
    }
    default: {
      date.setDate(date.getDate() + 1);
      break;
    }
  }
  return date.getTime();
}
