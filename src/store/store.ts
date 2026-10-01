import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { api } from "@/store/api";
import { authReducer } from "@/store/authSlice";
import { uiReducer } from "@/store/uiSlice";

const rootReducer = combineReducers({
    auth: authReducer,
    ui: uiReducer,
    [api.reducerPath]: api.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// A new store per request on the server; one per browser tab on the client.
export function makeStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: rootReducer,
        preloadedState,
        middleware: (getDefault) => getDefault().concat(api.middleware),
    });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
