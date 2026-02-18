export interface QueryConfig {
  enabled?: boolean;
  retry?: number | boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export interface MutationConfig {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}
