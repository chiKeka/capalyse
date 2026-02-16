import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {} from "@radix-ui/react-dropdown-menu";
import { CIcons } from "../ui/CIcons";
import { useRouter } from "next/navigation";

const GetStarted = ({ component }: { component: ReactNode }) => {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{component}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {routes.map((route) => (
          <DropdownMenuItem
            key={route.name}
            onClick={() => router.push(route.url)}
            className="group"
          >
            <route.icon className="group-hover:hidden flex-shrink-0" />
            <route.icon2 className="hidden group-hover:block flex-shrink-0" />
            <span className="group-hover:!text-green text-base">{route.name}</span>
            <CIcons.longArrowRight className="hidden group-hover:block ml-auto flex-shrink-0" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GetStarted;

const routes = [
  {
    icon: CIcons.smeOutline,
    icon2: CIcons.smeSolid,
    name: "As SME",
    url: "/sme/signup",
  },
  {
    icon: CIcons.investorOutline,
    icon2: CIcons.investorSolid,
    name: "As Investor",
    url: "/investor/signup",
  },
  {
    icon: CIcons.organisationOutline,
    icon2: CIcons.investorSolid,
    name: "As Organisation",
    url: "/development/signup",
  },
];
