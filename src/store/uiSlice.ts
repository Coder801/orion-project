import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Theme } from '@/types'

export interface UiState {
  theme: Theme
  isSidebarOpen: boolean
}

export const initialUiState: UiState = {
  theme: 'dark',
  isSidebarOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUiState,
  reducers: {
    themeChanged(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
    themeToggled(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    sidebarOpened(state) {
      state.isSidebarOpen = true
    },
    sidebarClosed(state) {
      state.isSidebarOpen = false
    },
  },
  selectors: {
    selectTheme: (state) => state.theme,
    selectIsSidebarOpen: (state) => state.isSidebarOpen,
  },
})

export const { themeChanged, themeToggled, sidebarOpened, sidebarClosed } = uiSlice.actions
export const { selectTheme, selectIsSidebarOpen } = uiSlice.selectors
export const uiReducer = uiSlice.reducer
