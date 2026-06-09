import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { edgeApi } from '../../services/edgeApi';
import HistoryUI from '../presentational/HistoryUI';

export default function HistoryContainer() {
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['history-logs'],
    queryFn: () => edgeApi.getInferenceLogs(0),
    refetchInterval: 10000,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['history-logs'] });
    queryClient.invalidateQueries({ queryKey: ['inference-logs'] });
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

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => edgeApi.deleteRecord(id),
    onSuccess: invalidateAll,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: ({ ids }) => edgeApi.bulkDelete(ids),
    onSuccess: invalidateAll,
  });

  const cleanupMutation = useMutation({
    mutationFn: () => edgeApi.cleanupOrphaned(),
    onSuccess: (data) => {
      invalidateAll();
      alert(`Cleanup complete: removed ${data.cleaned} orphaned record(s).`);
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => edgeApi.deleteAll(),
    onSuccess: (data) => {
      invalidateAll();
    },
  });

  return (
    <HistoryUI
      logs={logs}
      isLoading={isLoading}
      onLabelAssign={(id, label) => labelMutation.mutate({ id, label })}
      onLabelRemove={(id) => removeLabelMutation.mutate({ id })}
      onDelete={(id) => deleteMutation.mutate({ id })}
      onBulkDelete={(ids) => bulkDeleteMutation.mutate({ ids })}
      onCleanup={() => cleanupMutation.mutate()}
      isCleaningUp={cleanupMutation.isPending}
      onDeleteAll={() => deleteAllMutation.mutate()}
    />
  );
}
