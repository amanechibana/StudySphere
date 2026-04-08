import { api } from "./client";

/* Current source of truth for the types will remain in the api folder*/
export interface User {
  _id: string;
  username: string;
  email: string | null;
  createdAt: Date;
}

export interface CreateUserRequest {
  firebaseUid: string;
  username: string;
  email?: string | null;
}

export const userApi = {
  getUser: (firebaseUid: string) => api.get<User>(`/users/${firebaseUid}`),
  createUser: (userData: CreateUserRequest) =>
    api.post<User>("/users", userData),
  updateUser: (firebaseUid: string, userData: Partial<CreateUserRequest>) =>
    api.patch<User>(`/users/${firebaseUid}`, userData),
  deleteUser: (firebaseUid: string) =>
    api.delete<void>(`/users/${firebaseUid}`),
};
