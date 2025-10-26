import { CIcons } from "@/components/ui/CIcons";
import Input from "@/components/ui/Inputs";
import { Input as FileInput } from "@/components/ui/input";
import { CountrySelect } from "react-country-state-city";

import Button from "@/components/ui/Button";
import StatusChangeModal from "@/components/useManagementComponents.tsx/modals";
import { updateProfile } from "@/hooks/useUpdateProfile";
import { authAtom } from "@/lib/atoms/atoms";
import { handleImageUpload } from "@/lib/uitils/fns";
import { developmentOrg } from "@/lib/uitils/types";
import { useAtomValue } from "jotai";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  setLoading: (loading: boolean) => void;
  onFinish: () => void;
  onSuccess?: () => void;
  isProfile?: boolean;
  initialData?: any;
}

const DevelopmentOrganisation = forwardRef<
  { submit: () => void; isLoading: boolean },
  Props
>(({ setLoading, onFinish, onSuccess, initialData, isProfile }, ref) => {
  const auth: any = useAtomValue(authAtom);
  const { dev_org } = updateProfile();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<developmentOrg>({
    defaultValues: {
      companyEmail: auth?.email,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        organizationName:
          initialData?.investorOrganizationInfo?.organizationName,
        companyEmail: initialData?.investorOrganizationInfo?.companyEmail,
        countryHeadquarters:
          initialData?.investorOrganizationInfo?.countryHeadquarters,
        website: initialData?.investorOrganizationInfo?.website,
      });
    }
  }, [initialData]);

  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [selectedStateName, setSelectedStateName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: any }>(
    {}
  );
  const [fileUploadLoading1, setFileUploadLoading1] = useState(false);
  const [fileUploadLoading2, setFileUploadLoading2] = useState(false);
  const [certificateFiles, setCertificateFiles] = useState<any[]>([]);
  const [operationalLicences, setOperationalLicences] = useState<any>([]);
  const [showModal, setShowModal] = useState(false);
  const handleCertificateFileUpload = async (e: any) => {
    if (e) setFileUploadLoading1(true);
    const file = e.target?.files[0];
    await handleImageUpload(file, (res: any) => {
      setCertificateFiles([
        {
          fileName: res?.original_filename,
          fileUrl: res?.secure_url,
          fileSize: res?.bytes,
          mimeType: res?.format,
        },
      ]);
      setFileUploadLoading1(false);
    });
  };
  useEffect(() => {
    setLoading(dev_org?.isPending);
  }, [dev_org?.isPending, setLoading]);
  const router = useRouter();
  const authState: any = useAtomValue(authAtom);
  const role = authState?.role?.toLowerCase();
  const handleOperationalLicenseFileUpload = async (e: any) => {
    if (e) setFileUploadLoading2(true);
    const file = e.target?.files[0];
    await handleImageUpload(file, (res: any) => {
      setOperationalLicences([
        {
          fileName: res?.original_filename,
          fileUrl: res?.secure_url,
          fileSize: res?.bytes,
          mimeType: res?.format,
        },
      ]);
      setFileUploadLoading2(false);
    });
  };

  useImperativeHandle(ref, () => ({
    submit: async () => {
      return new Promise<boolean>((resolve) => {
        handleSubmit(async (data) => {
          setIsLoading(true);
          setLoading(true);
          const formDataWithFiles = {
            ...data,
            documents: [
              ...certificateFiles.map((file: any) => ({
                type: "Certificate",
                document: file.fileUrl,
              })),
              ...operationalLicences.map((file: any) => ({
                type: "License",
                document: file.fileUrl,
              })),
            ],
            focusAreas: [""],
            operatingRegions: [""],
          };
          // Add your form submission logic here
          await dev_org
            .mutateAsync(formDataWithFiles)
            .then(() => {
              setShowModal(true);
              onSuccess?.();
              resolve(true);
            })
            .catch((err) => {
              // console.log(err);
              toast.error(err?.message);
              resolve(false);
            });
        })();
      });
    },
    isLoading,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2  gap-4">
      <div>
        <Input
          label="Organization Name*"
          placeholder="Enter organization name"
          {...register("organizationName", {
            required: "Organization name is required",
          })}
          type="text"
          name="organizationName"
        />
        {errors.organizationName && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.organizationName.message}
          </span>
        )}
      </div>

      <div>
        <Input
          label="Enter Company Email Address*"
          placeholder="Company@gmail.com"
          {...register("companyEmail", { required: "Email is required" })}
          type="email"
          name="companyEmail"
          readOnly={true}
        />
        {errors.companyEmail && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.companyEmail.message}
          </span>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          Country Of Residence
        </label>
        <CountrySelect
          value={selectedCountryName}
          autoComplete="new-country"
          inputClassName="w-full px-4 py-2 !border-none focus:!ring-0 focus:!border-none"
          onChange={(country: any) => {
            // console.log({ country });
            if (
              country &&
              typeof country === "object" &&
              "id" in country &&
              "name" in country
            ) {
              setSelectedCountryId(country.id);
              setSelectedCountryName(country.name);
              setValue("countryHeadquarters", country.name);
            }
          }}
          defaultValue={getValues()?.countryHeadquarters as any}
          onTextChange={(_txt: any) =>
            setValue("countryHeadquarters", _txt.target.value)
          }
        />
        {errors.countryHeadquarters && (
          <span className="col-span-2 text-[10px] border-none text-red-500">
            {errors.countryHeadquarters.message}
          </span>
        )}
      </div>

      <div>
        <Input
          className=""
          label="Business website (Optional)"
          placeholder="Input your website link"
          type="text"
          {...register("website", {
            setValueAs: (v) => {
              if (!v) return v;
              const value = String(v).trim();
              return /^https?:\/\//i.test(value) ? value : `https://${value}`;
            },
            pattern: {
              value:
                /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-.~:?#[\]@!$&'()*+,;=]*)*\/?$/,
              message: "Please enter a valid URL",
            },
          })}
        />
        {errors.website && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.website.message}
          </span>
        )}
      </div>

      {/* Certificate of Incorporation Upload */}
      <div>
        <div className="mb-2 font-medium flex items-center gap-2">
          Certificate of Incorporation
          {uploading.certOfIncorporation && (
            <span className="ml-2 text-xs text-gray-500 animate-pulse">
              Uploading...
            </span>
          )}
        </div>
        <label className="flex items-center justify-between border border-gray-300 rounded px-4 py-3 cursor-pointer hover:bg-gray-50">
          {fileUploadLoading1 ? (
            <Loader className="animate-spin" />
          ) : (
            <span className="flex items-center gap-2 text-gray-700">
              <span className="flex items-center justify-center">
                <CIcons.uploadIcon />
              </span>
              Upload Document
            </span>
          )}
          <span className="text-gray-500 text-xl">+</span>
          <FileInput
            disabled={fileUploadLoading1}
            name="supportFile"
            onChange={handleCertificateFileUpload}
            id="upload"
            type="file"
            className="hidden"
          />
        </label>
        {/* Show uploaded file name if present */}
        {certificateFiles?.map((items) => {
          return (
            <div className="mx-auto w-full items-start text-red-400 fotn-normal text-xs">
              {items.fileName}
            </div>
          );
        })}
        <p className="text-xs text-gray-400 mt-2">
          Accepted formats: PNG, PDF, DOC, DOCX, JPG, JPEG
        </p>
      </div>

      {/* Operational License or NGO/Development Registration Certificate Upload */}
      <div>
        <div className="mb-2 font-medium text-sm flex items-center gap-2">
          Operational License or NGO/Development Registration ....
          {uploading.operationalLicense && (
            <span className="ml-2 text-xs text-gray-500 animate-pulse">
              Uploading...
            </span>
          )}
        </div>
        <label className="flex items-center justify-between border border-gray-300 rounded px-4 py-3 cursor-pointer hover:bg-gray-50">
          {fileUploadLoading2 ? (
            <Loader className="animate-spin" />
          ) : (
            <span className="flex items-center gap-2 text-gray-700">
              <span className="flex items-center justify-center">
                <CIcons.uploadIcon />
              </span>
              Upload Document
            </span>
          )}
          <span className="text-gray-500 text-xl">+</span>
          <FileInput
            disabled={fileUploadLoading2}
            name="supportFile"
            onChange={handleOperationalLicenseFileUpload}
            id="upload"
            type="file"
            className="hidden"
          />
        </label>
        {/* Show uploaded file name if present */}
        {operationalLicences?.map((items: any) => {
          return (
            <div className="mx-auto w-full items-start text-red-400 fotn-normal text-xs">
              {items.fileName}
            </div>
          );
        })}
        <p className="text-xs text-gray-400 mt-2">
          Accepted formats: PNG, PDF, DOC, DOCX, JPG, JPEG
        </p>
      </div>
      {!isProfile && (
        <StatusChangeModal
          description="We're reviewing your details. You'll get an email once verification is complete."
          handleAction={() => {
            router.push(`/${role}/dashbord`);
            setShowModal(false);
          }}
          modalType="warning"
          handleCancel={() => {
            router.push(`/${role}/dashbaord`);
            setShowModal(false);
          }}
          title="Link sent!!"
          routename="A password reset link has been sent to your inbox"
          showModal={showModal}
        />
      )}

      {isProfile && (
        <Button
          type="submit"
          state={dev_org?.isPending ? "loading" : "default"}
          onClick={handleSubmit(async (data) => {
            setIsLoading(true);
            setLoading(true);
            const formDataWithFiles = {
              ...data,
              documents: [
                ...certificateFiles.map((file: any) => ({
                  type: "Certificate",
                  document: file.fileUrl,
                })),
                ...operationalLicences.map((file: any) => ({
                  type: "License",
                  document: file.fileUrl,
                })),
              ],
              focusAreas: [""],
              operatingRegions: [""],
            };
            // Add your form submission logic here
            await dev_org
              .mutateAsync(formDataWithFiles)
              .then(() => {
                setShowModal(true);
                onSuccess?.();
              })
              .catch((err) => {
                // console.log(err);
                toast.error(err?.message);
              });
          })}
        >
          {dev_org?.isPending ? "Submitting..." : "Submit"}
        </Button>
      )}
    </div>
  );
});

DevelopmentOrganisation.displayName = "DevelopmentOrganisation";

export default DevelopmentOrganisation;
