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

interface IncomingOffer {
  fromUserId: string;
  sdp: string;
}
interface IncomingAnswer {
  fromUserId: string;
  sdp: string;
}
interface IncomingIce {
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

// dB-ish threshold on a 0–255 byte average; ~12 lands above ambient hum but below normal speech
const SPEAKING_THRESHOLD = 12;
// keep "speaking" sticky for a moment after the user stops to avoid flicker between syllables
const SPEAKING_RELEASE_MS = 350;

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

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

  // WebRTC mesh: one RTCPeerConnection + one hidden <audio> element per remote peer
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioElsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  // queue ICE candidates that arrive before remote description is set
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const inVoiceRef = useRef(false);

  const inVoice = !!currentUserId && members.some((m) => m.userId === currentUserId);
  inVoiceRef.current = inVoice;

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

  const teardownPeer = useCallback((peerUserId: string) => {
    const pc = peersRef.current.get(peerUserId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      peersRef.current.delete(peerUserId);
    }
    const audio = audioElsRef.current.get(peerUserId);
    if (audio) {
      audio.srcObject = null;
      audio.remove();
      audioElsRef.current.delete(peerUserId);
    }
    pendingIceRef.current.delete(peerUserId);
  }, []);

  const teardownAllPeers = useCallback(() => {
    for (const peerId of [...peersRef.current.keys()]) teardownPeer(peerId);
  }, [teardownPeer]);

  const createPeer = useCallback(
    (peerUserId: string, isInitiator: boolean): RTCPeerConnection => {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peersRef.current.set(peerUserId, pc);

      // attach our mic tracks
      streamRef.current?.getTracks().forEach((t) => pc.addTrack(t, streamRef.current!));

      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("voice_ice", {
            roomId,
            toUserId: peerUserId,
            candidate: e.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (e) => {
        let audio = audioElsRef.current.get(peerUserId);
        if (!audio) {
          audio = document.createElement("audio");
          audio.autoplay = true;
          audio.style.display = "none";
          document.body.appendChild(audio);
          audioElsRef.current.set(peerUserId, audio);
        }
        audio.srcObject = e.streams[0];
        // some browsers need an explicit play() once a srcObject is set
        audio.play().catch(() => {});
      };

      pc.onconnectionstatechange = () => {
        const s = pc.connectionState;
        if (s === "failed" || s === "closed" || s === "disconnected") {
          teardownPeer(peerUserId);
        }
      };

      if (isInitiator) {
        (async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.emit("voice_offer", {
              roomId,
              toUserId: peerUserId,
              sdp: pc.localDescription!.sdp,
            });
          } catch (e) {
            console.warn("Failed to create offer:", e);
          }
        })();
      }

      return pc;
    },
    [socket, roomId, teardownPeer],
  );

  // create/teardown peers as voice membership changes
  useEffect(() => {
    if (!inVoice || !currentUserId || !socket) {
      // we left voice (or never joined): drop all peers
      if (peersRef.current.size > 0) teardownAllPeers();
      return;
    }
    const memberIds = new Set(members.map((m) => m.userId));

    // tear down peers for members who left voice
    for (const peerId of [...peersRef.current.keys()]) {
      if (!memberIds.has(peerId)) teardownPeer(peerId);
    }

    // open peers for members we don't yet have one with;
    // userId comparison decides who initiates so both sides don't send offers (glare avoidance)
    for (const m of members) {
      if (m.userId === currentUserId) continue;
      if (peersRef.current.has(m.userId)) continue;
      const isInitiator = currentUserId < m.userId;
      if (isInitiator) createPeer(m.userId, true);
    }
  }, [members, inVoice, currentUserId, socket, createPeer, teardownPeer, teardownAllPeers]);

  // handle incoming signaling from other peers
  useEffect(() => {
    if (!socket) return;

    async function handleOffer(data: IncomingOffer) {
      let pc = peersRef.current.get(data.fromUserId);
      if (!pc) pc = createPeer(data.fromUserId, false);
      try {
        await pc.setRemoteDescription({ type: "offer", sdp: data.sdp });
        // flush any ICE that arrived before remote description was set
        const queued = pendingIceRef.current.get(data.fromUserId) ?? [];
        for (const c of queued) await pc.addIceCandidate(c).catch(() => {});
        pendingIceRef.current.delete(data.fromUserId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket?.emit("voice_answer", {
          roomId,
          toUserId: data.fromUserId,
          sdp: pc.localDescription!.sdp,
        });
      } catch (e) {
        console.warn("Failed to handle offer:", e);
      }
    }

    async function handleAnswer(data: IncomingAnswer) {
      const pc = peersRef.current.get(data.fromUserId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
        const queued = pendingIceRef.current.get(data.fromUserId) ?? [];
        for (const c of queued) await pc.addIceCandidate(c).catch(() => {});
        pendingIceRef.current.delete(data.fromUserId);
      } catch (e) {
        console.warn("Failed to handle answer:", e);
      }
    }

    async function handleIce(data: IncomingIce) {
      const pc = peersRef.current.get(data.fromUserId);
      // remote description may not be set yet; queue if so
      if (!pc || !pc.remoteDescription) {
        const list = pendingIceRef.current.get(data.fromUserId) ?? [];
        list.push(data.candidate);
        pendingIceRef.current.set(data.fromUserId, list);
        return;
      }
      try {
        await pc.addIceCandidate(data.candidate);
      } catch (e) {
        console.warn("Failed to add ICE candidate:", e);
      }
    }

    socket.on("voice_offer", handleOffer);
    socket.on("voice_answer", handleAnswer);
    socket.on("voice_ice", handleIce);
    return () => {
      socket.off("voice_offer", handleOffer);
      socket.off("voice_answer", handleAnswer);
      socket.off("voice_ice", handleIce);
    };
  }, [socket, roomId, createPeer]);

  const stopStream = useCallback(() => {
    teardownAudioGraph();
    teardownAllPeers();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, [teardownAudioGraph, teardownAllPeers]);

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

  // cleanup on unmount: drop mic, peers, and tell server we left
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
