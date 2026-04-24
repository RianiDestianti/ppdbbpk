import { createSlice } from '@reduxjs/toolkit';
import { getProfile, handleGoogleLogin } from '../controllers/authController';
import { DataAuthType, ResponseLoginType } from '../types/AuthTypes';

interface AuthState {
    loading         : boolean;
    responseLogin   : ResponseLoginType | null;
    error           : string | null;
    errorCode       : number | null;
    profile         : DataAuthType | null;
}

const initialState: AuthState = {
    loading         : false,
    responseLogin   : null,
    error           : null,
    errorCode       : null,
    profile         : null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        handleCleanResponse(state) {
            state.responseLogin = null;
            state.error         = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(handleGoogleLogin.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(handleGoogleLogin.fulfilled, (state, action) => {
                state.loading  = false;
                const response = action.payload;

                if (response.status === 200) {
                    state.responseLogin = response.data;
                    state.error         = null;
                } else {
                    state.error         = response.message;
                }
            })
            .addCase(handleGoogleLogin.rejected, (state) => {
                state.loading = false;
                state.error   = 'Gagal login dengan Google';
            })

            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading   = false;
                state.profile   = action.payload.data;
                state.errorCode = action.payload.status;
            });
    },
});

export const { handleCleanResponse } = authSlice.actions;
export default authSlice.reducer;
