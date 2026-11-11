export interface UserProfile {
  id: number;
  username: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  hasAvatar: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdateRequest {
  displayName: string;
  email: string;
  phone: string;
  address: string;
}