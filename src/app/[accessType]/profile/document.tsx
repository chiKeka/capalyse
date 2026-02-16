import { ReusableTable } from "@/components/ui/table";
import useDocument, { Document as DocumentType } from "@/hooks/useDocument";
import { File, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";

type Props = {};

export default function Document({}: Props) {
  const { useGetDocuments, useDeleteDocument } = useDocument();
  const { data: documents } = useGetDocuments();

  const deleteMutation = useDeleteDocument();
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  // console.log(documents, 'documents');
  const handleDelete = (id: string) => {
    setSelectedDocument(id || null);
    deleteMutation.mutate(id);
  };
  const columns = useMemo(() => {
    return [
      {
        header: "File name",
        accessor: (row: DocumentType) => (
          <div className="flex items-center gap-2">
            <div className="items-center w-6 h-6  flex bg-[#F4FFFC] rounded-full">
              <File className="text-green w-5 h-5" />
            </div>

            <div>
              <div className="font-medium text-sm text-[#101828]">{row.originalName}</div>
              <div className="text-xs text-gray-400">{row.size}</div>
            </div>
          </div>
        ),
      },
      {
        header: "Date uploaded",
        accessor: (row: DocumentType) => format(row.uploadedAt, "MMM dd, yyyy"),
      },
      {
        header: "Category",
        accessor: "category",
      },
      {
        header: "",
        accessor: (row: DocumentType) => (
          <div className="flex gap-4 items-end justify-end">
            {row.category !== "assessment" && (
              <button
                onClick={() => handleDelete(row._id)}
                className="text-gray-400 hover:text-red-600"
              >
                {selectedDocument === row._id && deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
            {/* <button className="text-gray-400 hover:text-green-600">
              <Pen className="w-4 h-4" />
            </button> */}
          </div>
        ),
        className: "text-right",
      },
    ];
  }, [documents]);
  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6 ">
      <ReusableTable
        columns={columns}
        data={documents || []}
        noDataText="No documents found check back later, any new document added will be found here"
        noDataCaption="No documents found check back later"
      />
      {/* <div className="flex mt-8 w-full justify-end lg:flex-row flex-col items-end pr-6">
        <Button
          iconPosition="file"
          variant="primary"
          size="medium"
          className="w-fit my-4 "
        >
          Upload
        </Button>
      </div> */}
    </div>
  );
}
