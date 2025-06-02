import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const BASE_URL = "https://capalyze-api.ikempeter2020.workers.dev/api";

// ========== GET: Waitlist Count ==========
export const useWaitlistCount = () => {
  return useQuery({
    queryKey: ["waitlistCount"],
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
      toast.success("Successfully joined the waitlist!");
      queryClient.invalidateQueries({ queryKey: ["waitlistCount"] });
    },
    onError: () => {
      toast.error("Failed to join the waitlist");
    },
  });
};

// ========== GET: Resources ==========
export const useResources = () => {
  return useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const res = await axios.get(`${BASE_URL}/resources`);
      return res?.data.data;
    },
  });
};
