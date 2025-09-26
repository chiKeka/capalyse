import api from "@/api/axios";
import { programsRoutes } from "@/api/endpoints";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface ProgramFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  smeStage: string[];
  eligibleCountries: string[];
  industryFocus: string[];
  maxParticipants: number;
  supportTypes: string[];
}

interface UseProgramFormReturn {
  formData: ProgramFormData;
  isLoading: boolean;
  error: string | null;
  updateField: (field: keyof ProgramFormData, value: any) => void;
  submitForm: () => Promise<void>;
  resetForm: () => void;
}

const initialFormData: ProgramFormData = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  smeStage: [],
  eligibleCountries: [],
  industryFocus: [],
  maxParticipants: 1,
  supportTypes: [],
};

export const useProgramForm = (): UseProgramFormReturn => {
  const [formData, setFormData] = useState<ProgramFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof ProgramFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name) {
      setError("Program name is required");
      return false;
    }
    if (!formData.description) {
      setError("Description is required");
      return false;
    }
    if (!formData.startDate) {
      setError("Start date is required");
      return false;
    }
    if (!formData.endDate) {
      setError("End date is required");
      return false;
    }
    if (formData.smeStage.length === 0) {
      setError("At least one SME stage must be selected");
      return false;
    }
    if (formData.eligibleCountries.length === 0) {
      setError("At least one eligible country must be specified");
      return false;
    }
    if (formData.industryFocus.length === 0) {
      setError("At least one industry focus must be selected");
      return false;
    }
    if (formData.supportTypes.length === 0) {
      setError("At least one support type must be selected");
      return false;
    }

    return true;
  };

  const submitForm = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!validateForm()) {
        return;
      }

      // TODO: Replace with actual API call
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create program");
      }

      // Reset form on success
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setError(null);
  };

  return {
    formData,
    isLoading,
    error,
    updateField,
    submitForm,
    resetForm,
  };
};

export const createProgram = () => {
  return useMutation({
    mutationFn: async (data: ProgramFormData) => {
      const response = await api.post(programsRoutes.programs, data);

      if (!response.status) {
        throw new Error("Failed to create program");
      }

      return response;
    },
  });
};
