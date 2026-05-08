import { useCallback, useEffect, useRef, useState } from "react";
import useSocketStore from "../stores/socketStore";

export interface VoiceMember {
  userId: string;
  username: string;
  muted: boolean;
  speaking: boolean;
}

interface VoiceState {
  roomId: string;
  members: VoiceMember[];
}

// dB-ish threshold on a 0–255 byte average; ~12 lands above ambient hum but below normal speech
const SPEAKING_THRESHOLD = 12;
// keep "speaking" sticky for a moment after the user stops to avoid flicker between syllables
const SPEAKING_RELEASE_MS = 350;

export function useVoiceChat(roomId: string, currentUserId?: string) {
  const socket = useSocketStore((s) => s.socket);
  const [members, setMembers] = useState<VoiceMember[]>([]);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const speakingRef = useRef(false);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inVoice = !!currentUserId && members.some((m) => m.userId === currentUserId);

  useEffect(() => {
    if (!socket) return;
    function handleState(data: VoiceState) {
      if (data.roomId !== roomId) return;
      setMembers(data.members);
    }
    socket.on("voice_state", handleState);
    return () => {
      socket.off("voice_state", handleState);
    };
  }, [socket, roomId]);

  const emitSpeaking = useCallback(
    (next: boolean) => {
      if (speakingRef.current === next) return;
      speakingRef.current = next;
      socket?.emit("voice_speaking", { roomId, speaking: next });
    },
    [socket, roomId],
  );

  const teardownAudioGraph = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = null;
    analyserRef.current?.disconnect();
    analyserRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    speakingRef.current = false;
  }, []);

  const startSpeakingDetection = useCallback(
    (stream: MediaStream) => {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const buf = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i];
        const avg = sum / buf.length;

        const isLoud = avg > SPEAKING_THRESHOLD && !mutedRef.current;
        if (isLoud) {
          if (releaseTimerRef.current) {
            clearTimeout(releaseTimerRef.current);
            releaseTimerRef.current = null;
          }
          emitSpeaking(true);
        } else if (speakingRef.current && !releaseTimerRef.current) {
          releaseTimerRef.current = setTimeout(() => {
            releaseTimerRef.current = null;
            emitSpeaking(false);
          }, SPEAKING_RELEASE_MS);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [emitSpeaking],
  );

  const stopStream = useCallback(() => {
    teardownAudioGraph();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, [teardownAudioGraph]);

  const join = useCallback(async () => {
    if (!socket || requesting || streamRef.current) return;
    setError(null);
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mutedRef.current = false;
      setMuted(false);
      socket.emit("voice_join", { roomId });
      startSpeakingDetection(stream);
      // TODO: establish WebRTC peer connections with other voice members so audio actually flows
    } catch (e) {
      setError(e instanceof Error ? e.message : "Microphone unavailable");
    } finally {
      setRequesting(false);
    }
  }, [socket, roomId, requesting, startSpeakingDetection]);

  const leave = useCallback(() => {
    if (!socket) return;
    if (speakingRef.current) emitSpeaking(false);
    stopStream();
    socket.emit("voice_leave", { roomId });
  }, [socket, roomId, stopStream, emitSpeaking]);

  const toggleMute = useCallback(() => {
    if (!socket || !streamRef.current) return;
    const next = !muted;
    streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !next));
    mutedRef.current = next;
    setMuted(next);
    if (next && speakingRef.current) emitSpeaking(false);
    socket.emit("voice_mute", { roomId, muted: next });
  }, [socket, roomId, muted, emitSpeaking]);

  // cleanup on unmount: drop mic and tell server we left
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        socket?.emit("voice_leave", { roomId });
        stopStream();
      }
    };
  }, [socket, roomId, stopStream]);

  return { members, inVoice, muted, error, requesting, join, leave, toggleMute };
}
