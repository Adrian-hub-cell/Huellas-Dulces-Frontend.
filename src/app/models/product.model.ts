export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  available: boolean;
}

export interface ProductRequest {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}
