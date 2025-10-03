import { format } from 'date-fns';
import Link from 'next/link';

// Programs data array
const programsData = [
  {
    id: 1,
    name: 'SME Growth 2.0',
    status: 'Active',
    partnerOrganization: 'UNDP Nigeria',
    programDuration: 'Jan 4 - June 3 2022',
    totalApplicants: 25,
    assignedSMEs: 12,
    smeApplicants: [],
  },
  {
    id: 2,
    name: 'SME Growth 2.0',
    status: 'Ended',
    partnerOrganization: 'UNDP Nigeria',
    programDuration: 'Jan 4 - June 3 2022',
    totalApplicants: 20,
    assignedSMEs: 15,
    smeApplicants: [],
  },
  {
    id: 3,
    name: 'SME Growth 2.0',
    status: 'Active',
    partnerOrganization: 'UNDP Nigeria',
    programDuration: 'Jan 4 - June 3 2022',
    totalApplicants: 45,
    assignedSMEs: 23,
    smeApplicants: [],
  },
  {
    id: 4,
    name: 'SME Growth 2.0',
    status: 'Ended',
    partnerOrganization: 'UNDP Nigeria',
    programDuration: 'Jan 4 - June 3 2022',
    totalApplicants: 12,
    assignedSMEs: 5,
    smeApplicants: [],
  },
  {
    id: 5,
    name: 'SME Growth 2.0',
    status: 'Active',
    partnerOrganization: 'UNDP Nigeria',
    programDuration: 'Jan 4 - June 3 2022',
    totalApplicants: 8,
    assignedSMEs: 4,
    smeApplicants: [],
  },
  {
    id: 6,
    name: 'SME Growth 2.0',
    status: 'Ended',
    partnerOrganization: 'UNDP Nigeria',
    programDuration: 'Jan 4 - June 3 2022',
    totalApplicants: 44,
    assignedSMEs: 21,
    smeApplicants: [],
  },
  {
    id: 7,
    name: 'SME Growth 2.0',
    status: 'Active',
    partnerOrganization: 'UNDP Nigeria',
    programDuration: 'Jan 4 - June 3 2022',
    totalApplicants: 21,
    assignedSMEs: 12,
    smeApplicants: [],
  },
  {
    id: 8,
    name: 'SME Growth 2.0',
    status: 'Ended',
    partnerOrganization: 'UNDP Nigeria',
    programDuration: 'Jan 4 - June 3 2022',
    totalApplicants: 92,
    assignedSMEs: 24,
    smeApplicants: [],
  },
  {
    id: 9,
    name: 'SME Growth 2.0',
    status: 'Active',
    partnerOrganization: 'UNDP Nigeria',
    programDuration: 'Jan 4 - June 3 2022',
    totalApplicants: 3,
    assignedSMEs: 2,
    smeApplicants: [],
  },
];

// Programs table columns
const programColumns = [
  {
    header: 'Name',
    accessor: 'name',
    className: 'font-medium',
  },
  {
    header: 'Status',
    accessor: (row: any) => (
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            row.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
          }`}
        ></div>
        <span
          className={`text-sm ${
            row.status === 'Active' ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {row.status}
        </span>
      </div>
    ),
  },
  {
    header: 'Organization',
    accessor: (row: any) => row?.organization?.organizationName,
  },
  {
    header: 'Partner Organization',
    accessor: (row: any) =>
      row.partners?.map((partner: any) => partner.name).join(', '),
  },
  {
    header: 'Program Duration',
    accessor: (row: any) =>
      `${format(row.startDate, 'MMM d, yyyy')} - ${format(
        row.endDate,
        'MMM d, yyyy'
      )}`,
  },
  {
    header: 'Total Applicants',
    accessor: (row: any) => row?.applications?.total,
    className: 'text-center',
  },
  {
    header: 'Eligible Countries',
    accessor: (row: any) => row?.eligibleCountries?.join(', ') || '-',
    className: 'text-center',
  },
  {
    header: 'Assigned SMEs',
    accessor: (row: any) => row?.assignedSMEs?.length,
    className: 'text-center',
  },
  {
    header: 'Action',
    accessor: (row: (typeof programsData)[0]) => (
      <Link
        href={`/admin/program-management/${row.id}`}
        className="text-green font-medium hover:underline"
      >
        View Profile
      </Link>
    ),
    className: 'text-green-600',
  },
];

// SME Applicants data generation
const industries = [
  'Packaging',
  'Retail',
  'Agriculture',
  'HealthTech',
  'Technology',
  'Manufacturing',
  'Services',
];
const countries = [
  'Nigeria',
  'Kenya',
  'Uganda',
  'Cameroon',
  'Niger',
  'Ghana',
  'Tanzania',
];
const statuses = ['Assigned', 'Pending', 'Rejected'];

// Function to generate random SME applicants
const generateSMEApplicants = (count = 0) => {
  const applicants = [];

  for (let i = 1; i <= count; i++) {
    const randomIndustry =
      industries[Math.floor(Math.random() * industries.length)];
    const randomCountry =
      countries[Math.floor(Math.random() * countries.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const readinessScore = Math.floor(Math.random() * 91) + 10; // 10-100%

    applicants.push({
      id: i,
      businessName: `Business Name ${i}`,
      avatar: `/images/humanAvater.svg`, // Placeholder avatar
      industry: randomIndustry,
      country: randomCountry,
      readinessScore: `${readinessScore}%`,
      teamSize: 10,
      status: randomStatus,
      revenue: `$${Math.floor(Math.random() * 500000) + 50000}`, // Random revenue
      email: `business${i}@example.com`,
      phone: `+234${Math.floor(Math.random() * 1000000000)}`,
      description: `A ${randomIndustry.toLowerCase()} business operating in ${randomCountry}`,
    });
  }

  return applicants;
};

// Add SME applicants to each program

// SME Applicants table columns
const smeApplicantsColumns = [
  {
    header: 'Name',
    accessor: (row: any) => (
      <div className="flex items-center gap-2">
        {row?.avatar ? (
          <img
            src={row.avatar}
            alt={row.businessName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : null}
        <span className="font-medium text-sm">{row?.businessName}</span>
      </div>
    ),
  },
  {
    header: 'Industry',
    accessor: 'industry',
  },
  {
    header: 'Country',
    accessor: 'country',
  },
  {
    header: 'Readiness Score',
    accessor: (row: any) => (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{row?.readinessScore}</span>
      </div>
    ),
  },
  {
    header: 'Team Size',
    accessor: 'teamSize',
    className: 'text-center',
  },
  {
    header: 'Status',
    accessor: (row: any) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'Assigned'
            ? 'bg-green-100 text-green-800'
            : row.status === 'Pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    header: 'Action',
    accessor: (row: any) => (
      <button className="text-green-600 font-medium hover:underline text-sm">
        Assign
      </button>
    ),
    className: 'text-green-600',
  },
];

// Example usage - get SME applicants for a specific program
const getProgramApplicants = (programId: number) => {
  console.log({ programId });
  const program = programsData.find((p) => p.id == programId);

  const smeApplicants = generateSMEApplicants(program?.totalApplicants);
  console.log({ program, smeApplicants });
  return program ? smeApplicants : [];
};

// Example usage - get programs by status
const getProgramsByStatus = (status: string) => {
  return programsData.filter((program) => program.status === status);
};

// Export everything
export {
  programsData,
  programColumns,
  smeApplicantsColumns,
  getProgramApplicants,
  getProgramsByStatus,
};
