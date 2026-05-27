import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: true,
        error: null,
        isGuest: false,
        sessionReady: false,
        showSignUpModal: false,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setIsGuest: (state, action) => {
            state.isGuest = action.payload;
        },
        setSessionReady: (state, action) => {
            state.sessionReady = action.payload;
        },
        openSignUpModal: (state) => {
            state.showSignUpModal = true;
        },
        closeSignUpModal: (state) => {
            state.showSignUpModal = false;
        },
    },
});

export const {
    setUser,
    setLoading,
    setError,
    setIsGuest,
    setSessionReady,
    openSignUpModal,
    closeSignUpModal,
} = authSlice.actions;
export default authSlice.reducer;
