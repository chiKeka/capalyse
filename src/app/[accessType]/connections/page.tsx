"use client";

import { ReusableTable } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { cn } from "@/lib/utils";

const connections = [
  {
    name: "GreenPack Solutions Ltd.",
    avatar: "/avatars/01.png",
    industry: "Packaging",
    businessType: "Starter",
    serviceOffered: "Telemedicine Consultations, Health Insurance Plans",
    status: "Connected",
  },
  {
    name: "Food&Beverage Co.",
    avatar: "/avatars/02.png",
    industry: "Retail",
    businessType: "Registered",
    serviceOffered: "E-commerce Store, Delivery Services",
    status: "Shortlisted",
  },
  {
    name: "Food&Beverage Co.",
    avatar: "/avatars/03.png",
    industry: "Agriculture",
    businessType: "Starter",
    serviceOffered: "Farm Produce Supply, Irrigation System Installations",
    status: "Viewed",
  },
  {
    name: "Food&Beverage Co.",
    avatar: "/avatars/04.png",
    industry: "HealthTech",
    businessType: "Registered",
    serviceOffered: "Telemedicine Consultations, Health Insurance Plans",
    status: "Completed",
  },
  {
    name: "Food&Beverage Co.",
    avatar: "/avatars/05.png",
    industry: "Retail",
    businessType: "Starter",
    serviceOffered: "E-commerce Store, Delivery Services",
    status: "Shortlisted",
  },
  {
    name: "Food&Beverage Co.",
    avatar: "/avatars/01.png",
    industry: "Agriculture",
    businessType: "Starter",
    serviceOffered: "Farm Produce Supply, Irrigation System Installations",
    status: "Viewed",
  },
  {
    name: "Food&Beverage Co.",
    avatar: "/avatars/02.png",
    industry: "HealthTech",
    businessType: "Registered",
    serviceOffered: "Telemedicine Consultations, Health Insurance Plans",
    status: "Completed",
  },
  {
    name: "Food&Beverage Co.",
    avatar: "/avatars/03.png",
    industry: "Retail",
    businessType: "Starter",
    serviceOffered: "E-commerce Store, Delivery Services",
    status: "Shortlisted",
  },
  {
    name: "Food&Beverage Co.",
    avatar: "/avatars/04.png",
    industry: "Agriculture",
    businessType: "Registered",
    serviceOffered: "Farm Produce Supply, Irrigation System Installations",
    status: "Viewed",
  },
];

const getStatusClass = (status: string) => {
  switch (status) {
    case "Connected":
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Shortlisted":
      return "bg-yellow-100 text-yellow-800";
    case "Viewed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ConnectionsPage = () => {
  const columns = [
    {
      header: "Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.avatar} />
            <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    { header: "Industry", accessor: "industry" },
    { header: "Business Type", accessor: "businessType" },
    { header: "Service Offered", accessor: "serviceOffered" },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge variant="status" className={cn("capitalize", getStatusClass(row.status))}>
          <span
            className={cn(
              "mr-2 h-2 w-2 rounded-full",
              getStatusClass(row.status).replace("text", "bg"),
            )}
          />
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Action",
      accessor: () => <Button variant="tertiary">View Profile</Button>,
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Connections</h1>
          <Badge>12</Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary">
            <CIcons.filter /> Filter
          </Button>
          <Button>
            <CIcons.engage /> Message Business
          </Button>
        </div>
      </div>
      <div className="border shadow-sm rounded-lg">
        <ReusableTable columns={columns} data={connections} />
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ConnectionsPage;
