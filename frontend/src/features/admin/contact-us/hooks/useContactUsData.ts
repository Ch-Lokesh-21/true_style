import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactUsService } from '../services/contactUsService';
import type { ContactUsCreate, ContactUsUpdate } from '../types';

export const CONTACT_US_QUERY_KEYS = {
  all: ['contact-us'] as const,
  lists: () => [...CONTACT_US_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...CONTACT_US_QUERY_KEYS.lists(), filters] as const,
  details: () => [...CONTACT_US_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CONTACT_US_QUERY_KEYS.details(), id] as const,
};

export const useContactUsQuery = (params?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: CONTACT_US_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => contactUsService.getAll(params),
  });
};

export const useContactUsDetailQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: CONTACT_US_QUERY_KEYS.detail(id),
    queryFn: () => contactUsService.getById(id),
    enabled: !!id && enabled,
  });
};

export const useCreateContactUsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ContactUsCreate) => contactUsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_US_QUERY_KEYS.lists() });
    },
  });
};

export const useUpdateContactUsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactUsUpdate }) =>
      contactUsService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CONTACT_US_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CONTACT_US_QUERY_KEYS.detail(id) });
    },
  });
};

export const useDeleteContactUsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => contactUsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_US_QUERY_KEYS.lists() });
    },
  });
};