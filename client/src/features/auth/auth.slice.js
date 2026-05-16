import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: true,
        error: null,
        isUpdatingPassword: false,
        isGuest: false,
        sessionReady: false,
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
        setIsUpdatingPassword: (state, action) => {
            state.isUpdatingPassword = action.payload;
        },
        setIsGuest: (state, action) => {
            state.isGuest = action.payload;
        },
        setSessionReady: (state, action) => {
            state.sessionReady = action.payload;
        },
    },
});

export const {
    setUser,
    setLoading,
    setError,
    setIsUpdatingPassword,
    setIsGuest,
    setSessionReady,
} = authSlice.actions;
export default authSlice.reducer;
