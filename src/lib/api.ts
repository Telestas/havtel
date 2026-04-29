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

    if (response.status === 503) {
      window.dispatchEvent(new CustomEvent('app:maintenance', { detail: { message } }));
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

export async function refreshTokenRequest(refreshToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken },
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

// =====================================================================
// Catalog
// =====================================================================

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  children: Category[];
};

export type ProductImage = {
  id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  variant_id: string | null;
};

export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  price: string;
  variant_attributes: Record<string, unknown>;
  is_active: boolean;
  inventory: { qty_available: number } | null;
  images: ProductImage[];
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  price_from: string | null;
  primary_image_url: string | null;
  is_in_stock: boolean;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  attributes: Record<string, unknown>;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variants: ProductVariant[];
  images: ProductImage[];
};

export type PaginatedProducts = {
  items: ProductListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export async function listCategoriesRequest(): Promise<Category[]> {
  return apiRequest<Category[]>('/api/v1/categories');
}

export async function listProductsRequest(
  params: { page?: number; limit?: number; category?: string; search?: string } = {},
  token?: string,
): Promise<PaginatedProducts> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  const qs = query.toString();
  return apiRequest<PaginatedProducts>(`/api/v1/products${qs ? `?${qs}` : ''}`, { token });
}

export async function getProductRequest(slug: string, token?: string): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/v1/products/${slug}`, { token });
}

// =====================================================================
// Cart
// =====================================================================

export type ApiCartItemVariant = {
  id: string;
  sku: string;
  name: string;
};

export type ApiCartItem = {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
  variant: ApiCartItemVariant;
};

export type ApiCart = {
  id: string;
  expires_at: string;
  items: ApiCartItem[];
  total: string;
};

export async function getCartRequest(token: string): Promise<ApiCart> {
  return apiRequest<ApiCart>('/api/v1/cart', { token });
}

export async function addCartItemRequest(
  token: string,
  payload: { variant_id: string; quantity: number },
): Promise<ApiCart> {
  return apiRequest<ApiCart>('/api/v1/cart/items', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateCartItemRequest(
  token: string,
  variantId: string,
  quantity: number,
): Promise<ApiCart> {
  return apiRequest<ApiCart>(`/api/v1/cart/items/${variantId}`, {
    method: 'PATCH',
    token,
    body: { quantity },
  });
}

export async function removeCartItemRequest(token: string, variantId: string): Promise<ApiCart> {
  return apiRequest<ApiCart>(`/api/v1/cart/items/${variantId}`, {
    method: 'DELETE',
    token,
  });
}

export async function clearCartRequest(token: string): Promise<void> {
  return apiRequest<void>('/api/v1/cart', {
    method: 'DELETE',
    token,
  });
}

// =====================================================================
// Checkout
// =====================================================================

export type PickupPointPublic = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  phone: string | null;
  notes: string | null;
};

export async function listPickupPointsRequest(): Promise<PickupPointPublic[]> {
  return apiRequest<PickupPointPublic[]>('/api/v1/pickup-points');
}

export type CheckoutPayload = {
  shipping_address_id?: string;
  shipping_address?: OrderShippingAddress;
  pickup_point_id?: string;
  shipping_method: string;
  shipping_amount: number;
  tax_amount: number;
};

export type CheckoutResponse = {
  order_id: string;
  order_number: string;
  total_amount: string;
  payment_id: string;
  provider: string;
  external_reference: string;
  client_secret: string;
};

export async function checkoutRequest(
  token: string,
  payload: CheckoutPayload,
): Promise<CheckoutResponse> {
  return apiRequest<CheckoutResponse>('/api/v1/checkout', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function fetchMaintenanceStatus(): Promise<boolean> {
  try {
    const requestUrl = API_BASE_URL ? `${API_BASE_URL}/api/v1/health` : '/api/v1/health';
    const res = await fetch(requestUrl, { method: 'GET' });
    if (!res.ok) return false;
    const body = await res.json() as { maintenance?: boolean };
    return body.maintenance === true;
  } catch {
    return false;
  }
}
