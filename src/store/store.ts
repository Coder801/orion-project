import {
    combineReducers,
    configureStore,
    isRejectedWithValue,
    type Middleware,
} from "@reduxjs/toolkit";
import { api, type ApiError } from "@/store/api";
import { authReducer, sessionExpired } from "@/store/authSlice";
import { uiReducer } from "@/store/uiSlice";

const rootReducer = combineReducers({
    auth: authReducer,
    ui: uiReducer,
    [api.reducerPath]: api.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** Any API call answered with `unauthorized` ends the local session too. */
const sessionGuard: Middleware = (store) => (next) => (action) => {
    const result = next(action);
    if (
        isRejectedWithValue(action) &&
        (action.payload as ApiError | undefined)?.code === "unauthorized"
    ) {
        store.dispatch(sessionExpired());
        store.dispatch(api.util.resetApiState());
    }
    return result;
};

// A new store per request on the server; one per browser tab on the client.
export function makeStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: rootReducer,
        preloadedState,
        middleware: (getDefault) =>
            getDefault().concat(api.middleware, sessionGuard),
    });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
