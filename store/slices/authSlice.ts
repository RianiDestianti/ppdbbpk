import { createSlice } from '@reduxjs/toolkit';
import {
    addGoogleChild,
    getProfile,
    getSignature,
    handleGoogleLogin,
    saveSignature,
    selectGoogleChild,
} from '../controllers/authController';
import { DataAuthType, GoogleChild, ResponseLoginType } from '../types/AuthTypes';

interface AuthState {
    loading           : boolean;
    responseLogin     : ResponseLoginType | null;
    error             : string | null;
    errorCode         : number | null;
    profile           : DataAuthType | null;
    signature         : string | null;
    signatureSaving   : boolean;
    googleSession     : string | null;
    googleChildren    : GoogleChild[];
    requiresSelection : boolean;
}

const initialState: AuthState = {
    loading           : false,
    responseLogin     : null,
    error             : null,
    errorCode         : null,
    profile           : null,
    signature         : null,
    signatureSaving   : false,
    googleSession     : null,
    googleChildren    : [],
    requiresSelection : false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        handleCleanResponse(state) {
            state.responseLogin = null;
            state.error         = null;
        },
        handleClearGoogleSelection(state) {
            state.googleSession     = null;
            state.googleChildren    = [];
            state.requiresSelection = false;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(handleGoogleLogin.pending, (state) => {
                state.loading           = true;
                state.error             = null;
                state.requiresSelection = false;
                state.googleSession     = null;
                state.googleChildren    = [];
            })
            .addCase(handleGoogleLogin.fulfilled, (state, action) => {
                state.loading  = false;
                const response = action.payload;

                if (response.status === 200) {
                    if (response.data?.requires_selection) {
                        state.requiresSelection = true;
                        state.googleSession     = response.data.google_session;
                        state.googleChildren    = response.data.children ?? [];
                        state.responseLogin     = null;
                    } else {
                        state.responseLogin     = response.data;
                        state.requiresSelection = false;
                        state.googleSession     = null;
                        state.googleChildren    = [];
                    }
                    state.error = null;
                } else {
                    state.error = response.message;
                }
            })
            .addCase(handleGoogleLogin.rejected, (state) => {
                state.loading = false;
                state.error   = 'Gagal login dengan Google';
            })

            .addCase(selectGoogleChild.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(selectGoogleChild.fulfilled, (state, action) => {
                state.loading  = false;
                const response = action.payload;

                if (response.status === 200) {
                    state.responseLogin     = response.data;
                    state.requiresSelection = false;
                    state.googleSession     = null;
                    state.googleChildren    = [];
                    state.error             = null;
                } else {
                    state.error = response.message;
                }
            })
            .addCase(selectGoogleChild.rejected, (state) => {
                state.loading = false;
                state.error   = 'Gagal memilih anak';
            })

            .addCase(addGoogleChild.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(addGoogleChild.fulfilled, (state, action) => {
                state.loading  = false;
                const response = action.payload;

                if (response.status === 200) {
                    state.responseLogin     = response.data;
                    state.requiresSelection = false;
                    state.googleSession     = null;
                    state.googleChildren    = [];
                    state.error             = null;
                } else {
                    state.error = response.message;
                }
            })
            .addCase(addGoogleChild.rejected, (state) => {
                state.loading = false;
                state.error   = 'Gagal menambahkan anak baru';
            })

            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading   = false;
                state.profile   = action.payload.data;
                state.errorCode = action.payload.status;
            })

            .addCase(saveSignature.pending, (state) => {
                state.signatureSaving = true;
            })
            .addCase(saveSignature.fulfilled, (state, action) => {
                state.signatureSaving = false;
                if (action.payload?.status === 200 && action.payload?.data?.signature) {
                    state.signature = action.payload.data.signature;
                }
            })
            .addCase(saveSignature.rejected, (state) => {
                state.signatureSaving = false;
            })

            .addCase(getSignature.fulfilled, (state, action) => {
                if (action.payload?.status === 200) {
                    state.signature = action.payload.data?.signature ?? null;
                }
            });
    },
});

export const { handleCleanResponse, handleClearGoogleSelection } = authSlice.actions;
export default authSlice.reducer;
