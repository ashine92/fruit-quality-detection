import { useQuery } from '@tanstack/react-query';
import { edgeApi } from '../../services/edgeApi';
import DashboardUI from '../presentational/DashboardUI';
import { useStream } from '../../context/StreamContext';

export default function DashboardContainer() {
  // All stream/PiP state lives in the global StreamContext
  const {
    imgRef,
    isStreamActive,
    isClassifying,
    isPiP,
    togglePiP,
    toggleClassification,
  } = useStream();

  // ── Snapshot capture ──────────────────────────────────
  const handleCaptureSnapshot = async () => {
    if (!imgRef.current || !imgRef.current.src.startsWith('data:image')) {
      alert('No video stream to capture!');
      return;
    }
    try {
      const res = await edgeApi.saveSnapshot(imgRef.current.src);
      if (res.success) alert('Snapshot saved: ' + res.url);
    } catch {
      alert('Failed to save snapshot');
    }
  };

  // ── Queries ────────────────────────────────────────────
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
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant animate-pulse uppercase tracking-widest text-[10px]">
          Syncing with Edge AI Engine...
        </p>
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
      onTogglePiP={togglePiP}
      isPiP={isPiP}
    />
  );
}
