import apiClient from "@/services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { TunggakanPayload, TunggakanResponse } from "../types/TunggakanTypes";

export const checkTunggakan = createAsyncThunk<TunggakanResponse, TunggakanPayload>(
    "tunggakan/checkTunggakan",
    async (payload) => {
        const response = await apiClient.post("/spb/check-tunggakan", payload)
        return response.data
    }
)
