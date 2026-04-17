import { useQueryClient } from '@tanstack/react-query';

/** Invalide le cache des recommandations après liste / historique / notes. */
export function useInvalidateUserRecommendations() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['user-recommendations'], exact: false });
  };
}
