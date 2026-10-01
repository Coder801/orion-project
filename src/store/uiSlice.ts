import { createSlice } from "@reduxjs/toolkit";

// Colour theme is owned by next-themes; this slice only holds layout state.
export interface UiState {
    /** Mobile navigation drawer. */
    isSidebarOpen: boolean;
    /** Desktop sidebar collapsed to icons. */
    isSidebarCollapsed: boolean;
}

export const initialUiState: UiState = {
    isSidebarOpen: false,
    isSidebarCollapsed: false,
};

const uiSlice = createSlice({
    name: "ui",
    initialState: initialUiState,
    reducers: {
        sidebarOpened(state) {
            state.isSidebarOpen = true;
        },
        sidebarClosed(state) {
            state.isSidebarOpen = false;
        },
        sidebarCollapseToggled(state) {
            state.isSidebarCollapsed = !state.isSidebarCollapsed;
        },
    },
    selectors: {
        selectIsSidebarOpen: (state) => state.isSidebarOpen,
        selectIsSidebarCollapsed: (state) => state.isSidebarCollapsed,
    },
});

export const { sidebarOpened, sidebarClosed, sidebarCollapseToggled } =
    uiSlice.actions;
export const { selectIsSidebarOpen, selectIsSidebarCollapsed } =
    uiSlice.selectors;
export const uiReducer = uiSlice.reducer;
