import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { ReusableTable } from "@/components/ui/table";
import { useGetCurrentProfile } from "@/hooks/useProfileManagement";
import { useSmeProfile } from "@/hooks/useSmeProfile";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {};

type TeamMember = {
  name: string;
  email: string;
  role: string;
};

type TeamFormData = {
  teamMembers: TeamMember[];
};

export default function Team({}: Props) {
  const { updateTeamMemeber } = useSmeProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ProfileDetails = useGetCurrentProfile();
  const { data: user, isLoading, error } = ProfileDetails;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeamFormData>({
    defaultValues: {
      teamMembers: [{ name: "", email: "", role: "" }],
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        teamMembers: [{ name: "", email: "", role: "" }],
      });
    }
  }, [user, reset]);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "teamMembers",
  });

  const addTeamMember = () => {
    append({ name: "", email: "", role: "" });
  };

  const removeTeamMember = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: any) => {
    updateTeamMemeber
      .mutateAsync(data)
      .then((res) => {
        toast.success("Team updated successfully");
      })
      .catch((err) => toast.error(err?.msg));
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
  ];

  return (
    <>
      {user?.teamMembers && (
        <div className="w-full h-auto my-10">
          <ReusableTable columns={columns} data={user?.teamMembers} />{" "}
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-1 flex flex-col w-full rounded-md p-3 md:p-6 "
      >
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid w-full lg:grid-cols-3 gap-2 grid-cols-1 mb-4"
          >
            <Input
              {...register(`teamMembers.${index}.name` as const, {
                required: "Name is required",
              })}
              type="text"
              label="Name"
              className="h-[43px]"
              placeholder="Enter Name"
            />
            {errors.teamMembers?.[index]?.name && (
              <span className="text-[10px] text-red-500">
                {errors.teamMembers[index]?.name?.message}
              </span>
            )}

            <Input
              {...register(`teamMembers.${index}.email` as const, {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              label="Email"
              className="h-[43px]"
              placeholder="Enter Email"
            />
            {errors.teamMembers?.[index]?.email && (
              <span className="text-[10px] text-red-500">
                {errors.teamMembers[index]?.email?.message}
              </span>
            )}

            <div className="flex  items-center gap-2">
              <Input
                {...register(`teamMembers.${index}.role` as const, {
                  required: "Role is required",
                })}
                type="text"
                label="Role"
                className="h-[43px]"
                placeholder="Enter role"
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => removeTeamMember(index)}
                  className="h-[43px] px-3"
                >
                  Remove
                </Button>
              )}
            </div>
            {errors.teamMembers?.[index]?.role && (
              <span className="text-[10px] text-red-500">
                {errors.teamMembers[index]?.role?.message}
              </span>
            )}
          </div>
        ))}

        <div className="flex text-green font-bold text-sm lg:max-w-[87%] mt-8 w-full justify-end lg:flex-row flex-col items-end pr-6">
          <Button
            type="button"
            variant="secondary"
            onClick={addTeamMember}
            className="w-fit border-none"
          >
            Add Section +
          </Button>
        </div>

        <div className="flex lg:max-w-[87%] mt-8 w-full justify-end lg:flex-row flex-col items-end pr-6">
          <Button
            variant="primary"
            size="medium"
            className="w-fit my-4"
            type="submit"
            state={updateTeamMemeber.isPending ? "loading" : undefined}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </>
  );
}
