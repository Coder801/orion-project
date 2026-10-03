import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionUser } from "@/types";

export interface AuthState {
    user: SessionUser | null;
    /** Set by an explicit sign-out so guards don't bounce to the sign-in page. */
    signedOut: boolean;
}

export const initialAuthState: AuthState = {
    user: null,
    signedOut: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialAuthState,
    reducers: {
        loggedIn(state, action: PayloadAction<SessionUser>) {
            state.user = action.payload;
            state.signedOut = false;
        },
        loggedOut(state) {
            state.user = null;
            state.signedOut = true;
        },
        /** The API rejected the session (expired, revoked): guards send the user to sign-in. */
        sessionExpired(state) {
            state.user = null;
            state.signedOut = false;
        },
        sessionUpdated(state, action: PayloadAction<Partial<SessionUser>>) {
            if (state.user) state.user = { ...state.user, ...action.payload };
        },
    },
    selectors: {
        selectUser: (state) => state.user,
        selectIsAuthenticated: (state) => state.user !== null,
        selectUserId: (state) => state.user?.id ?? null,
        selectSignedOut: (state) => state.signedOut,
    },
});

export const { loggedIn, loggedOut, sessionExpired, sessionUpdated } =
    authSlice.actions;
export const {
    selectUser,
    selectIsAuthenticated,
    selectUserId,
    selectSignedOut,
} = authSlice.selectors;
export const authReducer = authSlice.reducer;
