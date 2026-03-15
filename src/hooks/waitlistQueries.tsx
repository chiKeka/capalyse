import { Data } from "@/components/sections/Resources";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

// ========== GET: Resources ==========
export const useResources = () => {
  return useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/resources`);
      return res?.data.resources;
    },
    throwOnError: (e) => {
      console.log({ e });
      toast.error("Failed to fetch resources");
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
    queryKey: ["resources"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/resources`);
      return res?.data.resources;
    },
    select: (data) => {
      const mapped = data?.map((item: any) => ({
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
      console.log({ error });
      // toast.error(error?.response?.data?.error || 'Failed to fetch resources');
      return false;
    },
  });
};
