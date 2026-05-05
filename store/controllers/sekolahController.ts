import apiClient from "@/services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { SekolahListPayload, SekolahListResponse } from "../types/SekolahTypes";

export const getSekolahByJenjang = createAsyncThunk<SekolahListResponse, SekolahListPayload>(
    "sekolah/getSekolahByJenjang",
    async (payload) => {
        const response = await apiClient.get(`/sekolah?jenjang=${encodeURIComponent(payload.jenjang)}`)
        return response.data
    }
)
