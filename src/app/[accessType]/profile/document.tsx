import Button from "@/components/ui/Button";
import { ReusableTable } from "@/components/ui/table";
import { File, Pen, Trash2 } from "lucide-react";

type Props = {};
const documents = [
  {
    name: "CAC Registration.pdf",
    size: "200 KB",
    date: "Jan 4, 2022",
    status: "Completed",
  },
  {
    name: "Pitch Deck.pptx",
    size: "200 KB",
    date: "Jan 4, 2022",
    status: "Completed",
  },
  {
    name: "Financial Statement.pdf",
    size: "200 KB",
    date: "Jan 4, 2022",
    status: "Completed",
  },
];

const columns = [
  {
    header: "File name",
    accessor: (row: (typeof documents)[0]) => (
      <div className="flex items-center gap-2">
        <div className="items-center w-6 h-6  flex bg-[#F4FFFC] rounded-full">
          <File className="text-green w-5 h-5" />
        </div>

        <div>
          <div className="font-medium text-sm text-[#101828]">{row.name}</div>
          <div className="text-xs text-gray-400">{row.size}</div>
        </div>
      </div>
    ),
  },
  { header: "Date uploaded", accessor: "date" },
  {
    header: "Status",
    accessor: (row: (typeof documents)[0]) => (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
        <div className="w-2 h-2 bg-[#22C55E]  rounded-full" /> {row.status}
      </span>
    ),
  },
  {
    header: "",
    accessor: () => (
      <div className="flex gap-4 items-end justify-end">
        <button className="text-gray-400 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
        <button className="text-gray-400 hover:text-green-600">
          <Pen className="w-4 h-4" />
        </button>
      </div>
    ),
    className: "text-right",
  },
];
export default function Document({}: Props) {
  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6 ">
      <ReusableTable columns={columns} data={documents} />
      <div className="flex mt-8 w-full justify-end lg:flex-row flex-col items-end pr-6">
        <Button
          iconPosition="file"
          variant="primary"
          size="medium"
          className="w-fit my-4 "
        >
          Upload
        </Button>
      </div>
    </div>
  );
}
