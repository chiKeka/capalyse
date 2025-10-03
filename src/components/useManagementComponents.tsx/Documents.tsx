import { FileText } from 'lucide-react';

const Documents = ({ data }: { data?: any }) => {
  const handleViewDocument = (document: string) => {
    window.open(document, '_blank');
  };
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Documents</h3>

      <div className="space-y-4">
        {data?.map((doc: any) => (
          <div
            className="flex items-center justify-between py-3"
            key={doc.document}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">{doc?.type}</div>
                <div className="text-sm text-gray-500">200 KB</div>
              </div>
            </div>
            <button
              onClick={() => handleViewDocument(doc.document)}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              View Document
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
