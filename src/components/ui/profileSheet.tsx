import Button from "./Button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isImportant?: boolean;
  isUnread?: boolean;
}

interface NotificationSheetProps {
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProfileSheet({ open, onOpenChange }: NotificationSheetProps) {
  const investment = [
    { name: "Viaplay Group", icon: "/images/viaPlay.svg" },
    { name: "Spotify", icon: "/icons/sportify.svg" },
    { name: "VKing Games", icon: "/images/king.svg" },
    { name: "DreamHack", icon: "/images/dreamHAck.svg" },
  ];

  const contact = [
    { name: "Website", icon: "/icons/web.svg" },
    { name: "LinkedIn", icon: "/icons/linkedIn.svg" },
    { name: "Facebook", icon: "/icons/facebook.svg" },
    { name: "X", icon: "/icons/twitter.svg" },
  ];
  const details = [
    {
      name: "Investor Name",
      activity: "Investor A",
    },
    {
      name: "Investment Type",
      activity: "Venture Capital",
    },
    {
      name: "Investment Focus",
      activity: "Agribusiness, Fintech",
    },
    {
      name: "Location",
      activity: "Kentucky, USA",
    },
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-[31.875rem] w-full">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <SheetTitle className="text-lg font-semibold">Profile</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-row gap-2">
            <img src={"/images/dasboardProfileImg.svg"} />
            <div className="h-auto flex flex-col justify-between">
              {details.map((items, i) => (
                <div key={i}>
                  {" "}
                  <p className="font-normal flex-col flex gap-4 text-sm">
                    {items.name}
                  </p>
                  <p className="font-bold text-sm">{items.activity}</p>
                </div>
              ))}
            </div>
          </div>
          <span className="inline-flex mt-2 items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            <div className="w-2 h-2 bg-[#22C55E]  rounded-full" /> Connected
          </span>

          <div className="my-6">
            <p className="font-bold mb-4 text-base text-[#0B0B0C]">
              Past Investments
            </p>
            <div className="flex flex-wrap w-full p-2 gap-3">
              {investment?.map((items, i) => (
                <div className="flex flex-col items-center" key={i}>
                  <img src={items.icon} className="w-16 h-16" />
                  <p className="text-sm font-normal mt-1">{items.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="my-6">
            <p className="font-bold mb-4 text-base text-[#0B0B0C]">Contact</p>
            <div className="flex flex-wrap w-full p-2 gap-3">
              {contact?.map((items, i) => (
                <div className="flex flex-col items-center" key={i}>
                  <img src={items.icon} className="w-10 h-10" />
                  <p className="text-sm font-normal mt-1">{items.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-20w-full flex flex-col gap-4">
            <hr className="h-[1px]" />
            <Button variant="primary" className="w-full">
              Send Message
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function NetworkProfileSheet({
  id,
  open,
  onOpenChange,
}: NotificationSheetProps) {
  
  const colaboration = [
    "Food & Beverage businesses",
    "Retail chains",
    "Export logistics providers",
  ];

  const contact = [
    { name: "Website", icon: "/icons/web.svg" },
    { name: "LinkedIn", icon: "/icons/linkedIn.svg" },
    { name: "Facebook", icon: "/icons/facebook.svg" },
    { name: "X", icon: "/icons/twitter.svg" },
  ];
  const services = [
    "Biodegradable food containers",
    "Custom-printed eco-bags",
    "Bulk packaging supply",
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-[31.875rem] w-full">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <SheetTitle className="text-lg font-semibold">Profile</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-row gap-2">
            <img
              src={"/icons/sportify.svg"}
              className="rounded-full h-21 w-21"
            />
            <div>
              <p className="text-black font-bold text-2xl">
                GreenPack Solutions Ltd
              </p>
              <span className="text-sm font-normal flex-row text-[#71717A] flex tracking-tight items-center  gap-2">
                <p>Packaging</p>
                <p className="text-2xl font-medium mb-2">.</p>
                <p>Nigeria</p>
              </span>
              <span className="inline-flex mt-2 items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700">
                <div className="w-2 h-2 bg-[#22C55E]  rounded-full" /> Connected
              </span>
            </div>
          </div>

          <div className="font-bold text-base text- mt-13">
            Business Summary
          </div>

          <div className="text-base font-normal text-start">
            GreenPack Solutions produces biodegradable packaging for food
            vendors and retail brands across West Africa, helping businesses
            reduce plastic waste.
          </div>

          <div className="mt-12">
            <p className="text-base font-bold">Services Offered</p>
            <div className="gap-2 mt-4">
              {services.map((item) => {
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
            <div className="gap-2 mt-4">
              {colaboration.map((item) => {
                return (
                  <div className="flex flex-row mt-2 gap-2">
                    <img src="/icons/verifyCheck.svg" />{" "}
                    <p className="text-base font-normal ">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="my-6">
            <p className="font-bold mb-4 text-base text-[#0B0B0C]">Contact</p>
            <div className="flex flex-wrap w-full p-2 gap-3">
              {contact?.map((items, i) => (
                <div className="flex flex-col items-center" key={i}>
                  <img src={items.icon} className="w-10 h-10" />
                  <p className="text-sm font-normal mt-1">{items.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-20w-full flex flex-col gap-4">
            <hr className="h-[1px]" />
            <Button variant="primary" className="w-full">
              Send Message
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
