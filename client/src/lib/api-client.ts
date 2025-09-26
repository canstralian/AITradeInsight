import { logger } from "./logger";

interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = performance.now();

    // Add default headers
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    logger.logRequest(url, options.method || "GET", options.body);

    try {
      const response = await fetch(url, config);
      const endTime = performance.now();

      logger.debug(`Request completed in ${endTime - startTime}ms`, {
        url,
        method: options.method,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.logResponse(url, response.status, errorData);

        const error: ApiError = new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
        error.status = response.status;
        error.code = errorData.code;
        error.details = errorData;

        throw error;
      }

      const data = await response.json();
      logger.logResponse(url, response.status, data);

      return data;
    } catch (error) {
      const endTime = performance.now();
      logger.error(
        `Request failed after ${endTime - startTime}ms`,
        error,
        "API",
      );

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Network request failed");
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;

    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // File upload with progress
  async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve({
              data: xhr.responseText,
              success: true,
            } as ApiResponse<T>);
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      const token = localStorage.getItem("authToken");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.open("POST", `${this.baseURL}${endpoint}`);
      xhr.send(formData);
    });
  }

  // Retry mechanism
  async retryRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<ApiResponse<T>> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        // Don't retry for client errors (4xx)
        if (error instanceof Error && "status" in error) {
          const apiError = error as ApiError;
          if (
            apiError.status &&
            apiError.status >= 400 &&
            apiError.status < 500
          ) {
            break;
          }
        }

        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt)),
        );
      }
    }

    throw lastError!;
  }
}

export const apiClient = new ApiClient();

// Utility function for handling API errors in components
export function handleApiError(error: any): string {
  if (error instanceof Error) {
    if ("status" in error) {
      const apiError = error as ApiError;
      switch (apiError.status) {
        case 401:
          // Handle unauthorized - redirect to login
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          return "Session expired. Please log in again.";
        case 403:
          return "You do not have permission to perform this action.";
        case 404:
          return "The requested resource was not found.";
        case 429:
          return "Too many requests. Please try again later.";
        case 500:
          return "Server error. Please try again later.";
        default:
          return apiError.message || "An unexpected error occurred.";
      }
    }
    return error.message;
  }

  return "An unexpected error occurred.";
}
