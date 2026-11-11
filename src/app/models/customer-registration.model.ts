export interface CustomerRegisterRequest {
  firstName: string;
  lastName: string;
  identificationNumber: string;
  email: string;
  phone: string;
  address: string;
  username: string;
  password: string;
}

export interface CustomerRegisterResponse {
  id: number;
  username: string;
  email: string;
  message: string;
}
