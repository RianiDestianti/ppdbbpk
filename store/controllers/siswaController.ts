import apiClient from "@/services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SiswaPayload } from "../types/SiswaTypes";

export const saveSiswa = createAsyncThunk<any, SiswaPayload>(
    "siswa/saveSiswa",
    async (payload) => {
        const response = await apiClient.post("/siswa", payload)
        return response.data
    }
)
