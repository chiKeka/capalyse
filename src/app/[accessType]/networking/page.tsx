'use client';
import Button from '@/components/ui/Button';
import { CIcons } from '@/components/ui/CIcons';
import { statusBadge } from '@/components/ui/statusBar';
import { ReusableTable } from '@/components/ui/table';
import Image from 'next/image';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Example data

const connections = [
  {
    name: 'GreenPack Solutions Ltd.',
    avatar: '/images/humanAvater.svg',
    industry: 'Packaging',
    businessType: 'Starter',
    serviceOffered: 'Telemedicine Consultations, Health Insurance Plans',
    status: 'Connected',
  },
  {
    name: 'Food&Beverage Co.',
    avatar: '/images/humanAvater.svg',
    industry: 'Retail',
    businessType: 'Registered',
    serviceOffered: 'E-commerce Store, Delivery Services',
    status: 'Shortlisted',
  },
  {
    name: 'Food&Beverage Co.',
    avatar: '/images/humanAvater.svg',
    industry: 'Agriculture',
    businessType: 'Starter',
    serviceOffered: 'Farm Produce Supply, Irrigation System Installations',
    status: 'Viewed',
  },
  {
    name: 'Food&Beverage Co.',
    avatar: '/images/humanAvater.svg',
    industry: 'HealthTech',
    businessType: 'Registered',
    serviceOffered: 'Telemedicine Consultations, Health Insurance Plans',
    status: 'Completed',
  },
  {
    name: 'Food&Beverage Co.',
    avatar: '/images/humanAvater.svg',
    industry: 'Retail',
    businessType: 'Starter',
    serviceOffered: 'E-commerce Store, Delivery Services',
    status: 'Shortlisted',
  },
  {
    name: 'Food&Beverage Co.',
    avatar: '/images/humanAvater.svg',
    industry: 'Agriculture',
    businessType: 'Starter',
    serviceOffered: 'Farm Produce Supply, Irrigation System Installations',
    status: 'Viewed',
  },
  {
    name: 'Food&Beverage Co.',
    avatar: '/images/humanAvater.svg',
    industry: 'HealthTech',
    businessType: 'Registered',
    serviceOffered: 'Telemedicine Consultations, Health Insurance Plans',
    status: 'Completed',
  },
  {
    name: 'Food&Beverage Co.',
    avatar: '/images/humanAvater.svg',
    industry: 'Retail',
    businessType: 'Starter',
    serviceOffered: 'E-commerce Store, Delivery Services',
    status: 'Shortlisted',
  },
  {
    name: 'Food&Beverage Co.',
    avatar: '/images/humanAvater.svg',
    industry: 'Agriculture',
    businessType: 'Registered',
    serviceOffered: 'Farm Produce Supply, Irrigation System Installations',
    status: 'Viewed',
  },
];

// Table columns
const columns = [
  {
    header: 'Name',
    accessor: (row: (typeof connections)[0]) => (
      <div className="flex items-center gap-2">
        <Image
          src={row.avatar}
          alt={row.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="font-medium text-sm">{row.name}</span>
      </div>
    ),
  },
  { header: 'Industry', accessor: 'industry' },
  { header: 'Business Type', accessor: 'businessType' },
  { header: 'Service Offered', accessor: 'serviceOffered' },
  {
    header: 'Status',
    accessor: (row: (typeof connections)[0]) => statusBadge(row.status),
  },
  {
    header: 'Action',
    accessor: () => (
      <div className="flex gap-2">
        <a href="#" className="text-green font-medium hover:underline">
          View Profile
        </a>
      </div>
    ),
  },
];

function NetworkingPage() {
  return (
    <div>
      {/* Filter Section */}
      <div className="flex items-center my-8 justify-between">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Connections
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {connections.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full justify-end">
          <Button variant="secondary">
            Filter <CIcons.filter />
          </Button>
          <Button variant="primary">
            Message Business
            <img className="w-[20px] h-[20px]" src={'/icons/message.svg'} />
          </Button>
        </div>
      </div>

      <ReusableTable columns={columns} data={connections} />
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
}

export default NetworkingPage;
