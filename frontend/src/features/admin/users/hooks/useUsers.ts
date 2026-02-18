import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { UserListParams } from '../types';

export const useUsers = (params?: UserListParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.list(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.get(id),
    enabled: !!id,
  });
};