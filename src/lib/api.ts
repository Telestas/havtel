const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';

export const API_BASE_URL =
  rawApiBaseUrl === '/' ? '' : rawApiBaseUrl.replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...requestOptions } = options;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const requestUrl = API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;

  const response = await fetch(requestUrl, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(requestOptions.headers ?? {}),
    },
    body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
  });

  if (!response.ok) {
    let message = 'Request failed';

    try {
      const errorBody = await response.json();
      if (typeof errorBody?.detail === 'string') {
        message = errorBody.detail;
      }
    } catch {
      // Keep fallback message when the response is not JSON.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  customer_type: 'b2c' | 'b2b';
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type UserAddress = {
  id: string;
  user_id: string;
  label: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  street: string;
  city: string;
  state: string | null;
  zip_code: string | null;
  country: string;
  tax_id: string | null;
  is_default: boolean;
};

export type OrderStatus = 'confirmed' | 'processing' | 'in_transit' | 'delivered' | 'cancelled';

export type OrderItem = {
  id: string;
  product_name: string;
  variant_name: string;
  unit_price: string;
  quantity: number;
  product_image_url: string | null;
};

export type OrderShippingAddress = {
  contact_name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export type Order = {
  id: string;
  order_number: string;
  tracking_code: string | null;
  status: OrderStatus;
  payment_type: string;
  shipping_method: string;
  shipping_address: OrderShippingAddress;
  subtotal_amount: string;
  shipping_amount: string;
  tax_amount: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
};

export async function loginRequest(payload: {email: string; password: string}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function registerRequest(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
  customer_type?: 'b2c' | 'b2b';
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function getCurrentUserRequest(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/v1/users/me', {
    method: 'GET',
    token,
  });
}

export async function updateCurrentUserRequest(
  token: string,
  payload: { full_name: string; phone?: string | null },
): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/v1/users/me', {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export type UserAddressPayload = {
  label?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  street: string;
  city: string;
  state?: string | null;
  zip_code?: string | null;
  country: string;
  tax_id?: string | null;
};

export type UserAddressUpdatePayload = Partial<UserAddressPayload>;

export async function listUserAddressesRequest(token: string): Promise<UserAddress[]> {
  return apiRequest<UserAddress[]>('/api/v1/users/me/addresses', {
    method: 'GET',
    token,
  });
}

export async function createUserAddressRequest(token: string, payload: UserAddressPayload): Promise<UserAddress> {
  return apiRequest<UserAddress>('/api/v1/users/me/addresses', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateUserAddressRequest(
  token: string,
  addressId: string,
  payload: UserAddressUpdatePayload,
): Promise<UserAddress> {
  return apiRequest<UserAddress>(`/api/v1/users/me/addresses/${addressId}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function deleteUserAddressRequest(token: string, addressId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/users/me/addresses/${addressId}`, {
    method: 'DELETE',
    token,
  });
}

export async function setDefaultUserAddressRequest(token: string, addressId: string): Promise<UserAddress> {
  return apiRequest<UserAddress>(`/api/v1/users/me/addresses/${addressId}/default`, {
    method: 'PATCH',
    token,
  });
}

export type CreateOrderPayload = {
  payment_type: string;
  shipping_method: string;
  shipping_amount: number;
  tax_amount: number;
  subtotal_amount: number;
  total_amount: number;
  shipping_address: OrderShippingAddress;
  items: Array<{
    product_name: string;
    variant_name: string;
    unit_price: number;
    quantity: number;
    product_image_url?: string | null;
  }>;
};

export async function createOrderRequest(token: string, payload: CreateOrderPayload): Promise<Order> {
  return apiRequest<Order>('/api/v1/orders', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function listOrdersRequest(token: string): Promise<Order[]> {
  return apiRequest<Order[]>('/api/v1/orders', {
    method: 'GET',
    token,
  });
}

export async function getOrderRequest(token: string, orderId: string): Promise<Order> {
  return apiRequest<Order>(`/api/v1/orders/${orderId}`, {
    method: 'GET',
    token,
  });
}
