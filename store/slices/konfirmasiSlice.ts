import { createSlice } from "@reduxjs/toolkit";
import { submitKonfirmasiPembayaran } from "../controllers/konfirmasiController";
import { KonfirmasiPembayaranState } from "../types/KonfirmasiTypes";

const initialState: KonfirmasiPembayaranState = {
    loading: false,
    response: null,
    error: null,
};

const konfirmasiSlice = createSlice({
    name: "konfirmasi",
    initialState,
    reducers: {
        resetKonfirmasi: (state) => {
            state.response = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitKonfirmasiPembayaran.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.response = null;
            })
            .addCase(submitKonfirmasiPembayaran.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
            })
            .addCase(submitKonfirmasiPembayaran.rejected, (state) => {
                state.loading = false;
                state.error = "Gagal mengirim konfirmasi pembayaran";
            });
    },
});

export const { resetKonfirmasi } = konfirmasiSlice.actions;
export default konfirmasiSlice.reducer;
