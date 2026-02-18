export interface User {
  _id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListParams {
  skip?: number;
  limit?: number;
  q?: string;
  email?: string;
}