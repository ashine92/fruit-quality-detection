import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { edgeApi } from '../../services/edgeApi';
import AnalyticsUI from '../presentational/AnalyticsUI';

/**
 * AnalyticsContainer - Smart Component (JavaScript Version)
 */
export default function AnalyticsContainer() {
  const queryClient = useQueryClient();

  const { data: trendData } = useQuery({
    queryKey: ['yield-trend'],
    queryFn: () => edgeApi.getYieldTrend(),
    refetchInterval: 5000, // Tự động làm mới 5 giây 1 lần
  });

  const { data: logs, refetch } = useQuery({
    queryKey: ['inference-logs'],
    queryFn: () => edgeApi.getInferenceLogs(),
    refetchInterval: 1000, // Tự động làm mới 1 giây 1 lần
  });

  const labelMutation = useMutation({
    mutationFn: ({ id, label }) => edgeApi.assignLabel(id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inference-logs'] });
    },
  });

  return (
    <AnalyticsUI 
      trendData={trendData} 
      logs={logs} 
      onRefresh={() => refetch()} 
      onLabelAssign={(id, label) => labelMutation.mutate({ id, label })}
    />
  );
}
