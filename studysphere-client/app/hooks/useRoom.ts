import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomApi, CreateRoomBody } from "../api/room";

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: () => roomApi.getRooms(),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ["room", id],
    queryFn: () => roomApi.getRoom(id),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoomBody) => roomApi.createRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}