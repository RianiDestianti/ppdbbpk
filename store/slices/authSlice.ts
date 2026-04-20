import { createSlice } from '@reduxjs/toolkit';
import { changePassword, getProfile, handleActionLogin } from '../controllers/authController';
import { ChangePasswordResponse, DataAuthType, ResponseLoginType } from '../types/AuthTypes';

interface AuthState {
    loading         : boolean;
    responseLogin   : ResponseLoginType | null;
    error           : string | null;
    errorCode       : number | null;
    profile         : DataAuthType | null;
    changePwLoading : boolean;
    changePwResp    : ChangePasswordResponse | null;
}

const initialState: AuthState = {
    loading         : false,
    responseLogin   : null,
    error           : null,
    errorCode       : null,
    profile         : null,
    changePwLoading : false,
    changePwResp    : null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        handleCleanResponse(state) {
            state.responseLogin = null;
            state.error         = null;
        },
        resetChangePwResp(state) {
            state.changePwResp = null;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(handleActionLogin.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(handleActionLogin.fulfilled, (state, action) => {
                state.loading = false;
                const response = action.payload;

                if (response.status === 200) {
                    state.responseLogin = response.data;
                    state.error         = null;
                } else {
                    state.error         = response.message;
                }
            })
            .addCase(handleActionLogin.rejected, (state) => {
                state.loading = false;
                state.error   = 'Gagal menghubungi server';
            })

            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading   = false;
                state.profile   = action.payload.data;
                state.errorCode = action.payload.status;
            })

            .addCase(changePassword.pending, (state) => {
                state.changePwLoading = true;
                state.changePwResp    = null;
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.changePwLoading = false;
                state.changePwResp    = action.payload;
            })
            .addCase(changePassword.rejected, (state) => {
                state.changePwLoading = false;
                state.changePwResp    = {
                    status  : 500,
                    message : 'Gagal menghubungi server',
                };
            });
    },
});

export const { handleCleanResponse, resetChangePwResp } = authSlice.actions;
export default authSlice.reducer;
