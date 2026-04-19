import apiClient from "@/services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SiswaPayload, UpdateSiswaPayload } from "../types/SiswaTypes";

export const saveSiswa = createAsyncThunk<any, SiswaPayload>(
    "siswa/saveSiswa",
    async (payload) => {
        const response = await apiClient.post("/siswa", payload)
        return response.data
    }
)

export const getMySiswa = createAsyncThunk<any>(
    "siswa/getMySiswa",
    async () => {
        const response = await apiClient.get("/siswa/me")
        return response.data
    }
)

export const updateSiswa = createAsyncThunk<any, UpdateSiswaPayload>(
    "siswa/updateSiswa",
    async (payload) => {
        const response = await apiClient.put("/siswa/update", payload)
        return response.data
    }
)
