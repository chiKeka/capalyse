import api from '@/api/axios';
import { ApiEndPoints, resourceRoutes } from '@/api/endpoints';
import { isNil, omitBy } from 'lodash';
import { useMutation, useQuery } from '@tanstack/react-query';

interface ResourceQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  type?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
export const useGetResources = (params?: ResourceQueryParams) => {
  const queryParams = omitBy(
    {
      ...params,
    },
    isNil
  );
  return useQuery({
    queryKey: ['resources', queryParams],
    queryFn: async () => {
      const response = await api.get(resourceRoutes.Resources, {
        params: queryParams,
      });

      const user = response?.data;
      return user;
    },
  });
};

// handles update, delete, and get a single resource
export const useSingleResource = (id: string) => {
  return useQuery({
    queryKey: ['current_profile'],
    queryFn: async () => {
      const response = await api.get(resourceRoutes.singleResource(id));

      const user = response?.data?.data?.user;
      return user;
    },
  });
};
// handles update, delete, and get a single resource
export const useGetResourceCategories = () => {
  return useQuery({
    queryKey: ['current_profile'],
    queryFn: async () => {
      const response = await api.get(resourceRoutes.resourcesCategories);

      const user = response?.data?.data?.user;
      return user;
    },
  });
};

// handles both update, delete and get single
export const useSingleResourceCategory = (category: string) => {
  return useQuery({
    queryKey: ['current_profile'],
    queryFn: async () => {
      const response = await api.get(
        resourceRoutes.singleResourceCategory(category)
      );

      const user = response?.data?.data?.user;
      return user;
    },
  });
};
// handles both update, delete and get single

export const useSearchResource = (searchParamd: string) => {
  return useQuery({
    queryKey: ['search_resources', searchParamd],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Search_Resources, {
        params: { search: searchParamd },
      });

      const user = response?.data?.data?.user;
      return user;
    },
  });
};

export const useGetPopularResource = () => {
  return useQuery({
    queryKey: ['current_profile'],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Popular_Resources);

      const user = response?.data?.data?.user;
      return user;
    },
  });
};

export const useResourceMutations = () => {
  const createResource = useMutation({
    mutationFn: async (cred): Promise<any> => {
      api.post(resourceRoutes.Resources, cred);
    },
  });

  const updateResource = useMutation({
    mutationFn: async (cred: any): Promise<any> => {
      api.post(resourceRoutes.singleResource(cred?.id));
    },
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) =>
      api.delete(resourceRoutes.singleResource(id)),
  });
  return {
    createResource,
    updateResource,
    deleteResource,
  };
};
