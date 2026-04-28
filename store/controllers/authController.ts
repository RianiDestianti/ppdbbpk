import api from "@/services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GoogleLoginRequest, SignaturePayload } from "../types/AuthTypes";

export const handleGoogleLogin = createAsyncThunk('/auth/google', async (payload: GoogleLoginRequest) => {
    const response = (await api.post(`/auth/google`, payload)).data;
    return response;
});

export const getProfile = createAsyncThunk('/auth/profile', async () => {
    const response = (await api.get(`/check-auth`)).data;
    return response;
});

export const saveSignature = createAsyncThunk('/auth/signature/save', async (payload: SignaturePayload) => {
    const response = (await api.post(`/auth/signature`, payload)).data;
    return response;
});

export const getSignature = createAsyncThunk('/auth/signature/get', async () => {
    const response = (await api.get(`/auth/signature`)).data;
    return response;
});
