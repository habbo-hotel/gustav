export abstract class BaseSDK {
  protected baseUrl: string;
  private isRefreshing = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  protected async request<T>(
    path: string,
    method: string,
    body?: any,
    options: RequestInit = {},
    isRetry = false
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
      // If 401 Unauthorized and not already retrying, attempt to refresh tokens
      if (
        response.status === 401 &&
        !isRetry &&
        !path.includes('/auth/refresh')
      ) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            });
            if (refreshRes.ok) {
              // Retry the original request
              return await this.request<T>(path, method, body, options, true);
            }
          } finally {
            this.isRefreshing = false;
          }
        }
      }

      const errorText = await response.text().catch(() => '');
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        if (errorText) {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        }
      } catch {
        // Not JSON error, use default message
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const responseText = await response.text();
    if (!responseText) {
      return undefined as unknown as T;
    }

    try {
      return JSON.parse(responseText) as T;
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText);
      throw e;
    }
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
