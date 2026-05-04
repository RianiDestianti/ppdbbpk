import apiClient from "@/services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    KonfirmasiPembayaranPayload,
    KonfirmasiPembayaranResponse,
} from "../types/KonfirmasiTypes";

export const submitKonfirmasiPembayaran = createAsyncThunk<KonfirmasiPembayaranResponse, KonfirmasiPembayaranPayload>(
    "konfirmasi/submitKonfirmasiPembayaran",
    async (payload) => {
        const response = await apiClient.post("/spb/konfirmasi-pembayaran", payload);
        return response.data;
    }
);
