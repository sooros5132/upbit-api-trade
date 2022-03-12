import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage에 저장할 때
// import storage from "redux-persist/lib/storage/session"; // session에 저장할 때
import { default as MarketTable } from "./MarketTable";

const persistConfig = {
  key: "root",

  //? auth, board, studio 3개의 reducer 중에 auth reducer만 localstorage에 저장합니다.
  //? blacklist -> 그것만 제외합니다
  storage,
  whitelist: ["Auth", "Theme"],
};

const rootReducer = combineReducers({
  MarketTable,
});

export default persistReducer(persistConfig, rootReducer);

export type RootState = ReturnType<typeof rootReducer>;
