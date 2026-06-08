import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { edgeApi } from '../../services/edgeApi';
import HistoryUI from '../presentational/HistoryUI';

/**
 * HistoryContainer — Smart Component
 * Fetches inference logs (all records) and passes to HistoryUI
 */
export default function HistoryContainer() {
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['history-logs'],
    queryFn: () => edgeApi.getInferenceLogs(0),
    refetchInterval: 10000,
  });

  const labelMutation = useMutation({
    mutationFn: ({ id, label }) => edgeApi.assignLabel(id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history-logs'] });
      queryClient.invalidateQueries({ queryKey: ['inference-logs'] });
    },
  });

  return (
    <HistoryUI
      logs={logs}
      isLoading={isLoading}
      onLabelAssign={(id, label) => labelMutation.mutate({ id, label })}
    />
  );
}
