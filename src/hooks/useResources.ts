import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetResources = () => {
  return useQuery({
    queryKey: ["current_profile"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Resources);

      const user = response?.data;
      return user;
    },
  });
};

export const useGetSingleResource = (id: string) => {
  return useQuery({
    queryKey: ["current_profile"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Single_Resource(id));

      const user = response?.data?.data?.user;
      return user;
    },
  });
};

export const useGetResourceCategory = (category: string) => {
  return useQuery({
    queryKey: ["current_profile"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Resource_Category(category));

      const user = response?.data?.data?.user;
      return user;
    },
  });
};

export const useSearchResource = (searchParamd: string) => {
  return useQuery({
    queryKey: ["current_profile"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Search_Resources);

      const user = response?.data?.data?.user;
      return user;
    },
  });
};

export const useGetPopularResource = () => {
  return useQuery({
    queryKey: ["current_profile"],
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
      api.post(ApiEndPoints.Resources, cred);
    },
  });

  const updateResource = useMutation({
    mutationFn: async (cred: any): Promise<any> => {
      api.post(ApiEndPoints.Single_Resource(cred?.id));
    },
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) =>
      api.delete(ApiEndPoints.Single_Resource(id)),
  });
  return {
    createResource,
    updateResource,
    deleteResource,
  };
};
