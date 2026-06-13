import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { edgeApi } from '../../services/edgeApi';
import AnalyticsUI from '../presentational/AnalyticsUI';

/**
 * AnalyticsContainer - Smart Component
 */
export default function AnalyticsContainer() {
  const queryClient = useQueryClient();

  const { data: trendData } = useQuery({
    queryKey: ['yield-trend'],
    queryFn: () => edgeApi.getYieldTrend(),
    refetchInterval: 5000,
  });

  const { data: logs, refetch } = useQuery({
    queryKey: ['inference-logs'],
    queryFn: () => edgeApi.getInferenceLogs(),
    refetchInterval: 1000,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['inference-logs'] });
    queryClient.invalidateQueries({ queryKey: ['history-logs'] });
    queryClient.invalidateQueries({ queryKey: ['production-stats'] });
  };

  const labelMutation = useMutation({
    mutationFn: ({ id, label }) => edgeApi.assignLabel(id, label),
    onSuccess: invalidateAll,
  });

  const removeLabelMutation = useMutation({
    mutationFn: ({ id }) => edgeApi.removeLabel(id),
    onSuccess: invalidateAll,
  });

  return (
    <AnalyticsUI
      trendData={trendData}
      logs={logs}
      onLabelAssign={(id, label) => labelMutation.mutate({ id, label })}
      onLabelRemove={(id) => removeLabelMutation.mutate({ id })}
    />
  );
}
