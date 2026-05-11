import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateUserRequest, UpdateProfileRequest, userApi } from "../api/user";

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => userApi.getMe(),
    enabled,
  });
}

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => userApi.getUsers(),
    enabled,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

export function useUser(firebaseUid: string) {
  return useQuery({
    queryKey: ["user", firebaseUid],
    queryFn: () => {
      userApi.getUser(firebaseUid);
    },
    enabled: !!firebaseUid,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userApi.createUser(userData),
    onSuccess: (_, userData) => {
      queryClient.invalidateQueries({
        queryKey: ["user", userData.firebaseUid],
      });
    },
  });
}

export function useUpdateUser(firebaseUid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData: Partial<CreateUserRequest>) =>
      userApi.updateUser(firebaseUid, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", firebaseUid] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (firebaseUid: string) => userApi.deleteUser(firebaseUid),
    onSuccess: (_, firebaseUid) => {
      queryClient.invalidateQueries({ queryKey: ["user", firebaseUid] });
    },
  });
}
