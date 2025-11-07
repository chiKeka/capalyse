"use client";

import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { usePublicProfile } from "@/hooks/useProfileManagement";
import { useSession } from "@/lib/auth-client";
import { useParams, useRouter } from "next/navigation";

type Props = {};

const page = (props: Props) => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const slug = params.slug as string;
  const { data: publicProfile } = usePublicProfile(slug);
  const data = {
    logo:
      publicProfile?.userRole === "development_org"
        ? publicProfile?.devOrgInfo?.organizationName
        : publicProfile?.smeBusinessInfo?.logo,
    businessName:
      publicProfile?.userRole === "development_org"
        ? publicProfile?.devOrgInfo?.organizationName
        : publicProfile?.smeBusinessInfo?.businessName,
    businessStage:
      publicProfile?.userRole === "development_org"
        ? publicProfile?.devOrgInfo?.organizationName
        : publicProfile?.smeBusinessInfo?.businessStage,
    countryOfOperation: ["Lagos"],
    contact: [
      {
        icon: <CIcons.web />,
        name: "Website",
        url:
          publicProfile?.userRole === "development_org"
            ? publicProfile?.smeBusinessInfo?.website
            : publicProfile?.smeBusinessInfo?.website,
      },
      {
        icon: <CIcons.linkedIn />,
        name: "LinkedIn",
        url: publicProfile?.smeBusinessInfo?.socials?.find(
          (social: { socialMedia: string }) => social.socialMedia === "LinkedIn"
        )?.url,
      },
      {
        icon: <CIcons.facebook />,
        name: "Facebook",
        url: publicProfile?.smeBusinessInfo?.socials?.find(
          (social: { socialMedia: string }) => social.socialMedia === "Facebook"
        )?.url,
      },
      {
        icon: <CIcons.twitter />,
        name: "X",
        url: publicProfile?.smeBusinessInfo?.socials?.find(
          (social: { socialMedia: string }) => social.socialMedia === "X"
        )?.url,
      },
    ],
    services: [
      "Biodegradable food containers",
      "Custom-printed eco-bags",
      "Bulk packaging supply",
    ],
    colaboration: [
      "Food & Beverage businesses",
      "Retail chains",
      "Export logistics providers",
    ],
  };
  console.log(publicProfile);
  return (
    <div className="grid max-w-7xl mx-auto h-screen   grid-cols-1 lg:grid-cols-[1fr_2fr] items-start gap-6 overflow-y-auto  p-4 lg:p-12">
      <div className="overflow-y-auto ">
        <div className="flex flex-row gap-4">
          <img
            src={data ? data?.logo : "/icons/sportify.svg"}
            className="rounded-full h-21 w-21"
          />
          <div>
            <p className="text-black font-bold text-2xl">
              {data?.businessName ?? "GreenPack Solutions Ltd"}
            </p>
            <span className="text-sm font-normal flex-row text-[#71717A] flex tracking-tight items-center  gap-2">
              <p>
                {publicProfile
                  ? publicProfile?.smeBusinessInfo?.businessStage
                  : "Stage"}
              </p>
              <p className="text-2xl font-medium mb-2">.</p>
              <p>
                {publicProfile
                  ? publicProfile?.smeBusinessInfo?.countryOfOperation.join(
                      ", "
                    )
                  : "Country"}
              </p>
            </span>
            <p className="text-sm font-normal flex-row text-[#71717A] flex tracking-tight items-center  gap-2">
              Readiness Score: 80%
            </p>
          </div>
        </div>
        <div className="my-6">
          <p className="font-bold mb-4 text-base text-[#0B0B0C]">Contact</p>
          <div className="flex flex-wrap w-full p-2 gap-8">
            {data?.contact?.map((items, i) => (
              <div className="flex flex-col items-center" key={i}>
                <div className="w-10 h-10 shadow-md rounded-full p-2 flex justify-center items-center">
                  {items.icon}
                </div>
                <p className="text-sm font-normal mt-1">{items.name}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 w-full flex flex-col gap-4">
          <Button
            variant="primary"
            className="w-2/3"
            onClick={() => router.push(`/overview/${slug}/financial-dashboard`)}
          >
            View Financial Dashboard
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto">
        <div className="font-bold text-base ">Business Summary</div>

        <div className="text-base font-normal text-start">
          GreenPack Solutions produces biodegradable packaging for food vendors
          and retail brands across West Africa, helping businesses reduce
          plastic waste.
        </div>

        <div className="mt-12">
          <p className="text-base font-bold">Products/Services Offered</p>
          <div className="gap-2 flex flex-wrap mt-4">
            {data?.services?.map((item) => {
              return (
                <div className="flex flex-row mt-2 gap-2">
                  <img src="/icons/verifyCheck.svg" />{" "}
                  <p className="text-base font-normal ">{item}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-12">
          <p className="text-base font-bold">Collaboration Interests</p>
          <div className="gap-2 flex flex-wrap mt-4">
            {data?.colaboration?.map((item) => {
              return (
                <div className="flex flex-row mt-2 gap-2">
                  <img src="/icons/verifyCheck.svg" />{" "}
                  <p className="text-base font-normal ">{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
