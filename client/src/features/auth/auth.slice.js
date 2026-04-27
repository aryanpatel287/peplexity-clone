import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        loading: true,
        error: null,
        isUpdatingPassword: false,
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
    },
});

export const { setUser, setLoading, setError, setIsUpdatingPassword } =
    authSlice.actions;
export default authSlice.reducer;
