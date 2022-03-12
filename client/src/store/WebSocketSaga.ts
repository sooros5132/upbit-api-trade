// import { call, put, select, flush, delay } from "redux-saga/effects";
// import { buffers, eventChannel } from "redux-saga";
// import { apiRequestURLs } from "src/utils/apiRequestURLs";

// type WebSocketTypes = 'upbit' | 'binance'
// // 소켓 만들기
// const createSocket = (type: WebSocketTypes) => {
//   switch(type){
//     case 'upbit':{
//       const ws = new WebSocket(apiRequestURLs.upbit.websocket);
//       ws.binaryType = "arraybuffer";

//       return ws;
//     }
//     case 'binance':{
//       const ws = new WebSocket(apiRequestURLs.upbit.websocket);
//       ws.binaryType = "arraybuffer";

//       return ws;
//     }
//   }
// };

// interface IConnectSocekt{
//   socket: WebSocket;
//   onOpen: () => {};
//   buffer?: typeof buffers
// }

// // 소켓 연결용
// const connectSocekt = ({
//   socket,onOpen, buffer}: IConnectSocekt) => {
//   return eventChannel((emit) => {
//     socket.onopen = onOpen;

//     socket.onmessage = (evt) => {
//       const enc = new TextDecoder("utf-8");
//       const arr = new Uint8Array(evt.data);
//       const data = JSON.parse(enc.decode(arr));

//       emit(data);
//     };

//     socket.onerror = (evt) => {
//       emit(evt);
//     };

//     const unsubscribe = () => {
//       socket.close();
//     };

//     return unsubscribe;
//   }, buffer || buffers.none());
// };

// // 웹소켓 연결용 사가
// const createConnectSocketSaga = (type, connectType, dataMaker) => {
//   const SUCCESS = `${type}_SUCCESS`;
//   const ERROR = `${type}_ERROR`;

//   return function* (action = {}) {
//     const client = yield call(createSocket);
//     const clientChannel = yield call(
//       connectSocekt,
//       client,
//       connectType,
//       action,
//       buffers.expanding(500)
//     );

//     while (true) {
//       try {
//         const datas = yield flush(clientChannel); // 버퍼 데이터 가져오기
//         const state = yield select();

//         if (datas.length) {
//           const sortedObj = {};
//           datas.forEach((data) => {
//             if (sortedObj[data.code]) {
//               // 버퍼에 있는 데이터중 시간이 가장 최근인 데이터만 남김
//               sortedObj[data.code] =
//                 sortedObj[data.code].timestamp > data.timestamp
//                   ? sortedObj[data.code]
//                   : data;
//             } else {
//               sortedObj[data.code] = data; // 새로운 데이터면 그냥 넣음
//             }
//           });

//           const sortedData = Object.keys(sortedObj).map(
//             (data) => sortedObj[data]
//           );

//           yield put({ type: SUCCESS, payload: dataMaker(sortedData, state) });
//         }
//         yield delay(500); // 500ms 동안 대기
//       } catch (e) {
//         yield put({ type: ERROR, payload: e });
//       }
//     }
//   };
// };

// export {
//   connectSocekt,
//   createSocket,
// createConnectSocketSaga
// }
export {};
