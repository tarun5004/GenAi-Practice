import axios, { AxiosError } from "axios";

export type ApiEnvelope<T> = {
  success: true;
  data: T;
};

export type ApiErrorEnvelope = {
  success: false;
  message: string;
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response.data.data,
  (error: AxiosError<ApiErrorEnvelope>) => {
    const message = error.response?.data?.message ?? error.message ?? "Request failed";
    const status = error.response?.status;
    return Promise.reject(new ApiError(message, status));
  }
);

export default apiClient;