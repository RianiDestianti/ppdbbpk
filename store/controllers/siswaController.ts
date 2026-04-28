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

export const getMySiswa = createAsyncThunk<any, string | undefined>(
    "siswa/getMySiswa",
    async (noreg) => {
        const url      = noreg ? `/siswa/me?noreg=${encodeURIComponent(noreg)}` : "/siswa/me"
        const response = await apiClient.get(url)
        return response.data
    }
)

export const getMySiswaList = createAsyncThunk<any>(
    "siswa/getMySiswaList",
    async () => {
        const response = await apiClient.get("/siswa/me/list")
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
