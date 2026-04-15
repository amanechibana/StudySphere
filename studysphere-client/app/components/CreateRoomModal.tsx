"use client";

import { useState } from "react";
import { useCreateRoom } from "../hooks/useRoom";
import useUserStore from "../stores/userStore";
import { createRoomSchema } from "../validation/roomSchema";

interface CreateRoomModalProps {
  onClose: () => void;
}

export default function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const { user } = useUserStore();
  const { mutate: createRoom, isPending } = useCreateRoom();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [capacity, setCapacity] = useState(6);
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a room");
      return;
    }

    const result = createRoomSchema.safeParse({ name, description, course, capacity, isPrivate });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    
    setError(null);
    createRoom(
      { ...result.data, ownerId: user!._id },
      {
        onSuccess: () => onClose(),
        onError: () => setError("Failed to create room, please try again"),
      }
    );
  }

  return (
    <div className="fixed inset-0 bg-espresso/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-surface-card border border-border rounded-2xl p-8 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold text-espresso mb-1">Create a room</h2>
        <p className="text-sm text-caramel italic mb-6">Set up your study space.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-espresso-muted">Room name</label>
            <input
              required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Finals Grind"
              className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-espresso-muted">Description</label>
            <input
              required value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Studying for the final exam"
              className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-espresso-muted">Course</label>
            <input
              required value={course} onChange={(e) => setCourse(e.target.value)}
              placeholder="CS 554"
              className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium text-espresso-muted">Capacity</label>
              <input
                type="number" min={1} max={50} required
                value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}
                className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-espresso outline-none focus:border-caramel transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                <input
                  type="checkbox" checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 accent-espresso"
                />
                <span className="text-sm font-medium text-espresso-muted">Private</span>
              </label>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 border border-border text-espresso-muted text-sm font-medium py-2.5 rounded-lg hover:bg-background transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isPending}
              className="flex-1 bg-espresso text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-espresso-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
