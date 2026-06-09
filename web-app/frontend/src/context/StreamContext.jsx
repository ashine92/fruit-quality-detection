/**
 * StreamContext — Global persistent context
 *
 * Key design: canvas drawing uses a standalone Image() object (not imgRef),
 * so it works even when DashboardContainer is unmounted (tab switched).
 *
 * imgRef  → only for the <img> visible on Dashboard (can be null)
 * pipImg  → persistent Image() that always receives every frame → draws to canvas
 */
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const StreamCtx = createContext(null);

export function StreamProvider({ children }) {
  // ── Refs ──────────────────────────────────────────────
  const imgRef    = useRef(null);   // <img> shown in Dashboard (may be null when unmounted)
  const canvasRef = useRef(null);   // hidden canvas for PiP stream
  const videoRef  = useRef(null);   // hidden video for PiP API

  // Persistent Image() object — receives every WebSocket frame regardless of Dashboard mount state
  const pipImgRef = useRef(null);

  // ── State ─────────────────────────────────────────────
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isClassifying,  setIsClassifying]  = useState(false);
  const [isPiP,          setIsPiP]          = useState(false);
  const [socket,         setSocket]         = useState(null);
  const streamTimeoutRef = useRef(null);

  // ── Init persistent Image() once ─────────────────────
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      // Only draw to canvas when PiP window is active
      const canvas = canvasRef.current;
      if (!canvas || !document.pictureInPictureElement) return;

      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    pipImgRef.current = img;
  }, []);

  // ── WebSocket — connect once, survive all tab switches ─
  useEffect(() => {
    const s = io(`http://${window.location.hostname}:5000`);
    setSocket(s);

    s.on('video_frame_downstream', (base64Frame) => {
      // 1. Update Dashboard <img> if mounted
      if (imgRef.current) {
        imgRef.current.src = base64Frame;
      }

      // 2. Feed the persistent PiP Image() — triggers onload → canvas draw
      if (pipImgRef.current) {
        pipImgRef.current.src = base64Frame;
      }

      setIsStreamActive(true);
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = setTimeout(() => setIsStreamActive(false), 2000);
    });

    s.on('classification_state', (data) => setIsClassifying(data.active));

    return () => s.disconnect();
  }, []);

  // ── PiP toggle ───────────────────────────────────────
  const togglePiP = useCallback(async () => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;

    // Exit PiP
    if (document.pictureInPictureElement) {
      try { await document.exitPictureInPicture(); } catch {}
      return;
    }

    if (!canvas || !video) return;

    // ① Draw current frame to canvas (use pipImgRef which always has latest frame)
    const srcImg = pipImgRef.current;
    const w = (srcImg && srcImg.naturalWidth)  || 640;
    const h = (srcImg && srcImg.naturalHeight) || 480;
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (srcImg && srcImg.complete && srcImg.naturalWidth > 0) {
      ctx.drawImage(srcImg, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for stream...', w / 2, h / 2);
    }

    // ② Attach canvas stream to video once
    if (!video.srcObject) {
      video.srcObject = canvas.captureStream(30);
    }

    // ③ Play video
    try { await video.play(); } catch {}

    // ④ Wait for browser to register live frames
    await new Promise(r => setTimeout(r, 250));

    // ⑤ Open PiP
    try {
      await video.requestPictureInPicture();
    } catch (err) {
      console.error('PiP failed:', err);
    }
  }, []);

  // ── PiP browser event sync ────────────────────────────
  useEffect(() => {
    const onEnter = () => setIsPiP(true);
    const onLeave = () => setIsPiP(false);
    document.addEventListener('enterpictureinpicture', onEnter);
    document.addEventListener('leavepictureinpicture', onLeave);
    return () => {
      document.removeEventListener('enterpictureinpicture', onEnter);
      document.removeEventListener('leavepictureinpicture', onLeave);
    };
  }, []);

  // ── Socket helpers ────────────────────────────────────
  const toggleClassification = useCallback(() => {
    if (socket) socket.emit('set_classification_state', { active: !isClassifying });
  }, [socket, isClassifying]);

  const value = {
    imgRef,          // pass to Dashboard <img ref={imgRef}>
    isStreamActive,
    isClassifying,
    isPiP,
    togglePiP,
    toggleClassification,
  };

  return (
    <StreamCtx.Provider value={value}>
      {/* These elements NEVER unmount — they live here at root level */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, pointerEvents: 'none' }}
      />
      <video
        ref={videoRef}
        muted
        playsInline
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, pointerEvents: 'none' }}
      />
      {children}
    </StreamCtx.Provider>
  );
}

export function useStream() {
  const ctx = useContext(StreamCtx);
  if (!ctx) throw new Error('useStream must be used inside <StreamProvider>');
  return ctx;
}
