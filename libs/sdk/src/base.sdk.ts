export abstract class BaseSDK {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  protected async request<T>(
    path: string,
    method: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  protected get<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, 'GET', undefined, options);
  }

  protected post<T>(path: string, body?: any, options?: RequestInit) {
    return this.request<T>(path, 'POST', body, options);
  }

  protected put<T>(path: string, body?: any, options?: RequestInit) {
    return this.request<T>(path, 'PUT', body, options);
  }

  protected patch<T>(path: string, body?: any, options?: RequestInit) {
    return this.request<T>(path, 'PATCH', body, options);
  }

  protected delete<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, 'DELETE', undefined, options);
  }
}
