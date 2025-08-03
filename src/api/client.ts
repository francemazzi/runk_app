import { config } from "@/lib/config";

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.backendUrl;
    console.log("🔧 ApiClient inizializzato:", {
      baseUrl: this.baseUrl,
      frontendUrl: config.frontendUrl,
      isProduction: config.isProduction,
      isVercel: config.isVercel,
    });
  }

  async get<T>(endpoint: string, withCredentials = true): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(
      "📡 GET Request:",
      url,
      withCredentials ? "(with credentials)" : "(no credentials)"
    );

    const options: RequestInit = {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      mode: "cors",
    };

    // Solo includi credentials se necessario
    if (withCredentials) {
      options.credentials = "include";
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    withCredentials = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(
      "📡 POST Request:",
      url,
      withCredentials ? "(with credentials)" : "(no credentials)"
    );

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      mode: "cors",
      body: data ? JSON.stringify(data) : undefined,
    };

    // Solo includi credentials se necessario
    if (withCredentials) {
      options.credentials = "include";
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
