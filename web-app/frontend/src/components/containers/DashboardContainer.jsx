import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { edgeApi } from '../../services/edgeApi';
import DashboardUI from '../presentational/DashboardUI';

export default function DashboardContainer() {
  const [videoFrame, setVideoFrame] = useState(null);

  // Connect to WebSocket Server
  useEffect(() => {
    const socket = io(`http://${window.location.hostname}:5000`);
    
    socket.on('video_frame_downstream', (base64Frame) => {
      setVideoFrame(base64Frame);
    });

    return () => socket.disconnect();
  }, []);

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

  return <DashboardUI stats={stats} telemetry={telemetry} latestLog={latestLog} videoFrame={videoFrame} />;
}
