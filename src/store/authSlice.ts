import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types'

export interface AuthState {
  user: User | null
}

export const initialAuthState: AuthState = {
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loggedIn(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    loggedOut(state) {
      state.user = null
    },
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthenticated: (state) => state.user !== null,
  },
})

export const { loggedIn, loggedOut } = authSlice.actions
export const { selectUser, selectIsAuthenticated } = authSlice.selectors
export const authReducer = authSlice.reducer
