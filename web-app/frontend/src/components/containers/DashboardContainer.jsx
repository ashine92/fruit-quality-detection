import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { edgeApi } from '../../services/edgeApi';
import DashboardUI from '../presentational/DashboardUI';

export default function DashboardContainer() {
  const imgRef = useRef(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const streamTimeoutRef = useRef(null);

  const [isClassifying, setIsClassifying] = useState(false);
  const [socketRef, setSocketRef] = useState(null);

  // Connect to WebSocket Server
  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:5000`);
    setSocketRef(socket);

    socket.on('video_frame_downstream', (base64Frame) => {
      // Bắn trực tiếp frame vào DOM để khỏi phải render lại nguyên cái React component (Tối ưu độ trễ)
      if (imgRef.current) {
        imgRef.current.src = base64Frame;
      }
      setIsStreamActive(true);
      
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = setTimeout(() => setIsStreamActive(false), 2000);
    });

    socket.on('classification_state', (data) => {
      setIsClassifying(data.active);
    });

    return () => socket.disconnect();
  }, []);

  const toggleClassification = () => {
    if (socketRef) {
      socketRef.emit('set_classification_state', { active: !isClassifying });
    }
  };

  const handleCaptureSnapshot = async () => {
    if (!imgRef.current || !imgRef.current.src.startsWith('data:image')) {
      alert("No video stream to capture!");
      return;
    }
    try {
      const res = await edgeApi.saveSnapshot(imgRef.current.src);
      if (res.success) {
        alert("Snapshot saved successfully: " + res.url);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save snapshot");
    }
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['production-stats'],
    queryFn: () => edgeApi.getProductionStats(),
    refetchInterval: 5000,
  });

  const { data: telemetry, isLoading: telLoading } = useQuery({
    queryKey: ['telemetry'],
    queryFn: () => edgeApi.getTelemetry(),
    refetchInterval: 1000,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['inference-logs'],
    queryFn: () => edgeApi.getInferenceLogs(0),
    refetchInterval: 2000,
  });

  if (statsLoading || telLoading || logsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        <p className="text-label-bold text-on-surface-variant animate-pulse uppercase tracking-widest text-[10px]">Syncing with Edge AI Engine...</p>
      </div>
    );
  }

  const latestLog = logs && logs.length > 0 ? logs[0] : null;

  return (
    <DashboardUI
      stats={stats}
      telemetry={telemetry}
      latestLog={latestLog}
      videoRef={imgRef}
      isStreamActive={isStreamActive}
      isClassifying={isClassifying}
      onToggleClassification={toggleClassification}
      onCaptureSnapshot={handleCaptureSnapshot}
    />
  );
}
