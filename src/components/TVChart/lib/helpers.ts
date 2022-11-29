export function getNextBarOpenTime(barTime: number, resolution: string) {
  const date = new Date(barTime);
  switch (resolution) {
    case '1s': {
      date.setSeconds(date.getSeconds() + 1);
      break;
    }
    case '1':
    case '1m': {
      date.setMinutes(date.getMinutes() + 1);
      break;
    }
    case '3':
    case '3m': {
      date.setMinutes(date.getMinutes() + 3);
      break;
    }
    case '5':
    case '5m': {
      date.setMinutes(date.getMinutes() + 5);
      break;
    }
    case '15':
    case '15m': {
      date.setMinutes(date.getMinutes() + 15);
      break;
    }
    case '30':
    case '30m': {
      date.setMinutes(date.getMinutes() + 30);
      break;
    }
    case '60':
    case '1h': {
      date.setHours(date.getHours() + 1);
      break;
    }
    case '120':
    case '2h': {
      date.setHours(date.getHours() + 2);
      break;
    }
    case '240':
    case '4h': {
      date.setHours(date.getHours() + 4);
      break;
    }
    case '360':
    case '6h': {
      date.setHours(date.getHours() + 6);
      break;
    }
    case '480':
    case '8h': {
      date.setHours(date.getHours() + 8);
      break;
    }
    case '720':
    case '12h': {
      date.setHours(date.getHours() + 12);
      break;
    }
    case '3D': {
      date.setDate(date.getDate() + 3);
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
    case '1D':
    default: {
      date.setDate(date.getDate() + 1);
      break;
    }
  }
  return date.getTime();
}
