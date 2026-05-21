import { useQuery } from '@tanstack/react-query';
import { edgeApi } from '../../services/edgeApi';
import AnalyticsUI from '../presentational/AnalyticsUI';

/**
 * AnalyticsContainer - Smart Component (JavaScript Version)
 */
export default function AnalyticsContainer() {
  const { data: trendData } = useQuery({
    queryKey: ['yield-trend'],
    queryFn: () => edgeApi.getYieldTrend(),
  });

  const { data: logs, refetch } = useQuery({
    queryKey: ['inference-logs'],
    queryFn: () => edgeApi.getInferenceLogs(),
  });

  return (
    <AnalyticsUI 
      trendData={trendData} 
      logs={logs} 
      onRefresh={() => refetch()} 
    />
  );
}
