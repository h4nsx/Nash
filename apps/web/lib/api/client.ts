export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  requestId?: string;
}

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
  errors?: Record<string, string[]>;
}

export class ApiException extends Error {
  constructor(
    public readonly error: ApiError,
    message?: string
  ) {
    super(message || error.message);
    this.name = 'ApiException';
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        statusCode: response.status,
        code: response.status === 401 ? 'UNAUTHORIZED' : 'HTTP_ERROR',
        message: response.status === 401 ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : (response.statusText || 'An unexpected error occurred.'),
      };
    }

    // Auto logout & redirect on 401 Unauthorized in client-side navigation
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('nash_user');
      // Only redirect if not already on login or register pages
      const pathname = window.location.pathname;
      if (pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password' && pathname !== '/reset-password') {
        window.location.href = `/login?session_expired=true&redirect=${encodeURIComponent(pathname)}`;
      }
    }

    throw new ApiException(errorData);
  }

  if (response.status === 204) {
    return { success: true } as ApiResponse<T>;
  }

  return response.json();
}
