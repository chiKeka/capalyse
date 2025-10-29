import { Data } from '@/components/sections/Resources';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set');
}

// ========== GET: Waitlist Count ==========
export const useWaitlistCount = () => {
  return useQuery({
    queryKey: ['waitlistCount'],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/waitlist/count`);
      return res?.data.data;
    },
  });
};

// ========== POST: Add to Waitlist ==========
export const useCreateWaitlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const res = await axios.post(`${BASE_URL}/waitlist`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlistCount'] });
    },
  });
};

// ========== GET: Resources ==========
export const useResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/resources`);
      return res?.data.data;
    },
    throwOnError: () => {
      toast.error('Failed to fetch resources');
      return false;
    },
  });
};

const getRandomThree = (arr: Data[]): Data[] => {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, 3);
};
// ========== GET: Resources ==========
export const useGetRandomResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/resources`);
      return res?.data.data;
    },
    select: (data) => {
      const mapped = data?.resources?.map((item: any) => ({
        title: item?.title,
        desc: item?.desc,
        image: item?.image,
        id: item?.link,
        link: item?.link,
      }));
      const randomThree = getRandomThree(mapped);
      return randomThree;
    },
    throwOnError: (error: any) => {
      // console.log({ error });
      toast.error(error?.response?.data?.error || 'Failed to fetch resources');
      return false;
    },
  });
};
